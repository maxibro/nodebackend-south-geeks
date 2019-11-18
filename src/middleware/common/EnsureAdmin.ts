import { ExpressMiddlewareInterface } from "@mardari/routing-controllers";
import { Request, Response, NextFunction } from "express";
import { UserType } from "./../../models";

export class EnsureAdmin implements ExpressMiddlewareInterface {
  public use(request: Request, response: Response, next?: NextFunction): any {
    if (response.locals.role !== UserType.admin) {
      // Forbidden: The request was valid, but the server is refusing action
      return response.status(403).send({
        message:
          "You don't have the necessary permissions for access to this resource"
      });
    }
    if (next !== undefined) {
      next();
    }
  }
}
