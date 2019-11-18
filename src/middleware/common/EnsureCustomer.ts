import { ExpressMiddlewareInterface } from "@mardari/routing-controllers";
import { Request, Response, NextFunction } from "express";
import { UserType } from "./../../models";
import { UserService } from "./../../services/UserService";
import { Inject } from "typedi";
import { User } from "@entities/User";

export class EnsureCustomer implements ExpressMiddlewareInterface {
  @Inject()
  private userService: UserService;

  public async use(
    request: Request,
    response: Response,
    next?: NextFunction
  ): Promise<any> {
    if (response.locals.role !== UserType.regular) {
      // Forbidden: The request was valid, but the server is refusing action
      return response.status(403).send({
        message:
          "You don't have the necessary permissions for access to this resource"
      });
    } else {
      const customer: User | undefined = await this.userService.getUserById(
        response.locals.userId
      );

      if (customer === undefined) {
        return response.status(403).send({
          message: "The user not exist in the system"
        });
      }

      response.locals.customer = customer;
    }
    if (next !== undefined) {
      next();
    }
  }
}
