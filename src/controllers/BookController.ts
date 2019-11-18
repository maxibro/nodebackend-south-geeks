import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Put,
  HttpCode,
  UseBefore,
  UploadedFile,
  Res,
  BadRequestError,
  OnUndefined,
  QueryParam
} from "@mardari/routing-controllers";
import { Response } from "express";
import { Inject, Service } from "typedi";
import path from "path";
import * as fs from "fs";
import { v1 as uuidv1 } from "uuid";
import { diskStorage, Options as multerOptions } from "multer";
import { EnsureAdmin } from "./../middleware/common/EnsureAdmin";
import { EnsureAuthenticated } from "./../middleware/common/EnsureAuthenticated";

import { Book } from "./../entities/Book";
import { IBook, UserType } from "./../models";
import { BookService } from "./../services/BookService";
import { IPaginationOptions, Pagination } from "./../utils/paginator";

const storage = diskStorage({
  destination: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, path.resolve("public/bookFiles"));
  },
  filename: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${uuidv1()}${path.extname(file.originalname)}`);
  }
});

export const fileUploadOptions: multerOptions = {
  storage: storage
};

@Service()
@JsonController()
export class BookController {
  @Inject()
  private bookService: BookService;

  @Get("/books")
  @UseBefore(EnsureAuthenticated)
  @HttpCode(200)
  @OnUndefined(404)
  public async getBooksPaginated(
    @Res() response: Response,
    @QueryParam("page", { required: false }) page: number = 0,
    @QueryParam("limit", { required: false }) limit: number = 10,
    @QueryParam("search", { required: false }) search?: string
  ): Promise<Pagination<IBook>> {
    const paginatorOptions: IPaginationOptions = {
      page,
      limit,
      route: `/books`
    };
    const books: Pagination<IBook> = await this.bookService.getBooksPaginated(
      paginatorOptions,
      {
        onlyActive: response.locals.role === UserType.regular,
        search
      }
    );
    return books;
  }

  @Get("/book/:id")
  public getOne(@Param("id") id: number) {
    return "This action returns book #" + id;
  }

  @HttpCode(201)
  @UseBefore(EnsureAuthenticated, EnsureAdmin)
  @Post("/book")
  public async post(
    @Body() newBook: IBook,
    @Res() response: Response,
    @UploadedFile("txt_file", {
      options: fileUploadOptions,
      required: true
    })
    txtFile: Express.Multer.File
  ): Promise<Book | undefined> {
    if (txtFile.mimetype.substr(0, 4) !== "text") {
      console.log("txtFile.mimetype", txtFile.mimetype);
      throw new BadRequestError("You must upload a txt file");
    }

    const book: Book = new Book();
    book.author = newBook.author;
    book.name = newBook.name;
    book.price = Math.round(newBook.price * 100) / 100;
    book.txtFileName = txtFile.originalname;
    book.txtFileUrl = txtFile.path;
    book.isActive = true;
    const insertId = await this.bookService.save(book);
    book.id = insertId;

    // now save the tags from the file async:
    this.saveTopWordsFromFile(book, txtFile.path);
    return book;
  }

  @HttpCode(200)
  @UseBefore(EnsureAuthenticated, EnsureAdmin)
  @OnUndefined(404)
  @Put("/inactive-book/:id")
  public async put(@Param("id") bookId: number): Promise<Book> {
    const book = await this.bookService.inactiveBook(bookId);

    return book;
  }

  private saveTopWordsFromFile(book: Book, filepath: string) {
    const readline = require("readline");
    // const fs = require("fs");

    const words: any = {};
    fs.readFile(filepath, (err, buf) => {
      const topWords = this.retrieveTopWordsFromFile(buf.toString());

      // service:
      this.bookService.saveTags(book, topWords);
    });
  }

  private retrieveTopWordsFromFile(stringBuffer: string): string[] {
    const words: any = {};

    const lineWords = stringBuffer
      .replace(/[^\w\s]/gi, "")
      .replace(/\n|\r/g, "")
      .split(" ");

    // create object words where each key is a word and the value = repetitions
    for (const element of lineWords) {
      if (element.length > 3) {
        if (typeof words[element] === "undefined") {
          words[element] = 1;
        } else {
          words[element]++;
        }
      }
    }

    const keysSorted = Object.keys(words)
      .sort((a, b) => words[b] - words[a])
      .slice(0, 4);

    return keysSorted;
  }
}
