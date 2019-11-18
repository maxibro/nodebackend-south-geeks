import {
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  OnUndefined,
  UseBefore,
  Res,
  BadRequestError,
  QueryParam
} from "@mardari/routing-controllers";
import { Response } from "express";
import { Inject } from "typedi";
import { EnsureAuthenticated } from "./../middleware/common/EnsureAuthenticated";
import { EnsureAdmin } from "./../middleware/common/EnsureAdmin";
import { EnsureCustomer } from "./../middleware/common/EnsureCustomer";

import { OrderService } from "./../services/OrderService";
import { Order } from "./../entities/Order";
import { Book } from "./../entities/Book";

import { Pagination, IPaginationOptions } from "src/utils/paginator";

@Controller()
export class OrderController {
  @Inject()
  private orderService: OrderService;

  @HttpCode(200)
  @OnUndefined(404)
  @UseBefore(EnsureAuthenticated, EnsureAdmin)
  @Get("/user-orders/:id")
  public async getOrdersByUser(@Param("id") userId: number): Promise<Order[]> {
    const orders = this.orderService.getOrdersByUser(userId);
    return orders;
  }

  @Get("/orders")
  @UseBefore(EnsureAuthenticated, EnsureAdmin)
  @HttpCode(200)
  @OnUndefined(404)
  public async getOrdersPaginated(
    @QueryParam("page", { required: false }) page: number = 0,
    @QueryParam("limit", { required: false }) limit: number = 10
  ): Promise<Pagination<Order>> {
    const paginatorOptions: IPaginationOptions = {
      page,
      limit,
      route: `/orders`
    };
    const orders: Pagination<Order> = await this.orderService.getOrdersPaginated(
      paginatorOptions
    );
    return orders;
  }

  @Get("/my-orders")
  @UseBefore(EnsureAuthenticated, EnsureCustomer)
  @HttpCode(200)
  @OnUndefined(404)
  public async getOrdersByUserPaginated(
    @Res() response: Response,
    @QueryParam("page", { required: false }) page: number = 0,
    @QueryParam("limit", { required: false }) limit: number = 10
  ): Promise<Pagination<Order>> {
    const paginatorOptions: IPaginationOptions = {
      page,
      limit,
      route: `/my-orders`
    };
    const orders: Pagination<Order> = await this.orderService.getOrdersByUserPaginated(
      paginatorOptions,
      {
        userId: response.locals.userId
      }
    );
    return orders;
  }

  @HttpCode(201)
  @UseBefore(EnsureAuthenticated, EnsureCustomer)
  @Post("/order")
  public async post(
    @Body() newOrder: any, // check IORder
    @Res() response: Response
  ): Promise<Order | undefined> {
    const userId: number = response.locals.userId;

    const order: Order = new Order();
    order.amount = newOrder.amount;
    order.userId = userId;
    if (!Array.isArray(newOrder.books)) {
      throw new BadRequestError("The order must have at least one book");
    }

    order.books = newOrder.books.map((element: any) => {
      const book = new Book();
      book.id = element.id;
      return book;
    });

    const result: Order = await this.orderService.save(order);

    return result;
  }

  @Get("/orders")
  public async getUserOrders() {
    return "This action returns all books";
  }

  @Get("/order/:id")
  public getOne(@Param("id") id: number) {
    return "This action returns order #" + id;
  }

  @Put("/order/:id")
  public put(@Param("id") id: number, @Body() order: any) {
    return "Updating a order...";
  }

  @Delete("/order/:id")
  public remove(@Param("id") id: number) {
    return "Removing order...";
  }
}
