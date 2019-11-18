import { Service } from "typedi";
import { getRepository } from "typeorm";
import { BadRequestError } from "@mardari/routing-controllers";
import { Order } from "./../entities/Order";
import { IPaginationOptions, Pagination, paginate } from "./../utils/paginator";

@Service()
export class OrderService {
  public async getOrdersByUserPaginated(
    paginatorOptions: IPaginationOptions,
    filter: { userId: any }
  ): Promise<Pagination<Order>> {
    const result = await paginate<Order>(
      getRepository("Order"),
      paginatorOptions,
      {
        where: { userId: filter.userId },
        order: { orderDate: "DESC" },
        relations: ["books"]
      }
    );
    return result;
  }

  public async getOrdersByUser(userId: number): Promise<Order[]> {
    const result = await getRepository<Order>("Order").find({
      where: { userId: userId },
      order: { orderDate: "DESC" },
      relations: ["books"]
    });

    return result;
  }

  public async getOrdersPaginated(
    paginatorOptions: IPaginationOptions
  ): Promise<Pagination<Order>> {
    const result = await paginate<Order>(
      getRepository("Order"),
      paginatorOptions,
      {
        order: { orderDate: "DESC" },
        relations: ["books", "user"]
      }
    );
    return result;
  }

  public async save(order: Order): Promise<Order> {
    try {
      const neworder: Order = await getRepository<Order>("Order").save(order);
      return neworder;
    } catch (error) {
      throw new BadRequestError("Error inserting the new order");
    }
  }
}
