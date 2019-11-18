import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import * as bodyParser from "body-parser";
import { useExpressServer } from "@mardari/routing-controllers";
import * as path from "path";
import helmet from "helmet";
import morgan from "morgan";
import { authorizationChecker } from "./../common/authorizationChecker";
import {
  UserController,
  BookController,
  OrderController
} from "./../../controllers";

export class ExpressConfig {
  public app: express.Express;
  constructor() {
    this.app = express();
    this.app.set("case sensitive routing", true);
    this.app.set("strict routing", true);
    this.app.set("view cache", true);
    this.app.set("views", path.join(__dirname, "..", "..", "..", "views"));
    this.app.set("view engine", "pug");
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(helmet());
    this.app.use(
      express.static(path.join(__dirname, "..", "..", "..", "public"))
    );
    if (this.app.get("env") !== "test") {
      this.app.use(morgan("common"));
    }
    this.app.use(this.clientErrorHandler);
    this.setUpControllers();

    this.app.get("/healthz", (req: Request, res: Response) => {
      res.status(200).send("I am happy and healthy\n");
    });
  }

  private setUpControllers() {
    useExpressServer(this.app, {
      authorizationChecker: authorizationChecker,
      controllers: [UserController, BookController, OrderController],
      cors: true,
      classTransformer: true,
      validation: true,
      defaults: {
        // with this option, null will return 404 by default
        nullResultCode: 404,
        // with this option, void or Promise<void> will return 204 by default
        undefinedResultCode: 204,
        paramOptions: {
          // with this option, argument will be required by default
          required: true
        }
      }
    });
  }

  private clientErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (err.hasOwnProperty("thrown")) {
      res.status(err.status).send({ error: err.message });
    }
  }
}
