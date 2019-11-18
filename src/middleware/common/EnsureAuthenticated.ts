import { ExpressMiddlewareInterface } from "@mardari/routing-controllers";
import jwt from "jwt-simple";
import moment from "moment";
import { Request, Response, NextFunction } from "express";
import { IJwtSession } from "@models";

export class EnsureAuthenticated implements ExpressMiddlewareInterface {
  public use(request: Request, response: Response, next?: NextFunction): any {
    if (!request.headers.authorization) {
      return response.status(401).send({
        message:
          "Authentication is required and has failed or has not yet been provided"
      });
    }
    const token = request.headers.authorization.split(" ")[1];
    let payload: IJwtSession;
    try {
      payload = jwt.decode(token, process.env.SECRET!);
    } catch (e) {
      return response.status(401).send({ message: "Invalid token" });
    }

    if (payload.exp <= moment().unix()) {
      return response.status(401).send({ message: "Expired token" });
    }

    response.locals.userId = payload.sub;
    response.locals.role = payload.role;

    if (next !== undefined) {
      next();
    }
  }
}
