import { Service } from "typedi";
import { getRepository, InsertResult } from "typeorm";
import { BadRequestError, NotFoundError } from "@mardari/routing-controllers";

import { Book } from "./../entities/Book";
import { Tag } from "./../entities/Tag";
import {
  IPaginationOptions,
  Pagination,
  paginate,
  paginateRawQuery
} from "./../utils/paginator";
import { IBook } from "./../models";

@Service()
export class BookService {
  public async getBooksPaginated(
    paginationOptions: IPaginationOptions,
    filter: {
      onlyActive: boolean;
      search: string | undefined;
    }
  ): Promise<Pagination<IBook>> {
    // search by name, author and keywords
    // accuracy is defined by: The most accurate result happens when the searched
    // word or group of words match exactly the name or author. The matching keywords are
    // second level of accuracy.

    let onlyActiveCondition = "";
    if (filter.onlyActive) {
      onlyActiveCondition = " AND b.isActive = 1 ";
    }

    let searchCondition = "";
    let orderCondition = "";
    let filterArray: string[] = [];
    if (filter.search) {
      searchCondition = ` AND (b.name LIKE CONCAT(?,'%') OR b.author LIKE CONCAT(?,'%') OR t.name LIKE CONCAT(?,'%')) `;
      orderCondition = ` IF(b.name = ? OR b.author = ?,0,1), IF( t.name = ?,0,1), `;
      filterArray = [
        filter.search,
        filter.search,
        filter.search,
        filter.search,
        filter.search,
        filter.search
      ];
    }

    const selectQueryString = `SELECT b.id,
          b.name,
          b.author,
          b.price,
          b.isActive,
          b.txtFileUrl,
          b.txtFileName,
          GROUP_CONCAT(t.name
              SEPARATOR ' , ') keywords `;
    const fromConditionsQueryString = ` FROM
              book b
                  LEFT JOIN
              book_tag bt ON b.id = bookId
                  LEFT JOIN
              tag t ON bt.tagId = t.id
          WHERE 1 = 1 
          ${onlyActiveCondition} 
          ${searchCondition}   
          GROUP BY b.id
          ORDER BY ${orderCondition} b.name, b.author
          `;

    const result: Pagination<IBook> = await paginateRawQuery<IBook>(
      "Book",
      selectQueryString,
      fromConditionsQueryString,
      filterArray,
      paginationOptions
    );

    return result;
  }

  public async inactiveBook(bookId: number) {
    const book: Book | undefined = await getRepository<Book>("Book").findOne(
      bookId
    );

    if (book === undefined) {
      throw new NotFoundError(`The book was not found.`);
    }
    book.isActive = false;
    return getRepository<Book>("Book").save(book);
  }

  public async save(book: Book): Promise<number> {
    try {
      const insertResult: InsertResult = await getRepository<Book>(
        "Book"
      ).insert(book);
      return insertResult.raw.insertId;
    } catch (error) {
      const dupEntryCode = "ER_DUP_ENTRY";

      if (error.code !== undefined && error.code === dupEntryCode) {
        throw new BadRequestError(
          "Already exists a book with same author and name."
        );
      }
      throw error;
    }
  }

  public saveTags(book: Book, topWords: string[]) {
    const tags: Tag[] = topWords.map(value => {
      const tag = new Tag();
      tag.name = value;
      return tag;
    });
    book.tags = tags;
    getRepository("Book").save(book);
  }
}
