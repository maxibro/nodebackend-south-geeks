import "reflect-metadata";
import getLogger from "../common/getLogger";
import { ExpressConfig } from "./Express";
import { Server } from "http";
import { getDbConnection } from "./../../db";
import { Container } from "typedi";
import { useContainer } from "@mardari/routing-controllers";
import {
  useContainer as ormUseContainer,
  getConnection,
  Connection
} from "typeorm";

const app = async (): Promise<Server> => {
  require("dotenv").config();
  const logger = getLogger("Server");
  Container.set("logger", logger);

  ormUseContainer(Container);
  let cnn: Connection;
  try {
    cnn = await getDbConnection();
  } catch (error) {
    console.log("ormUseContainerError");
    if (error.name === "AlreadyHasActiveConnectionError") {
      cnn = getConnection();
      if (process.env.NODE_ENV === "test") {
        console.log("ormUseContainer");
        await cnn.synchronize(true);
        await cnn.runMigrations();
      }
    } else {
      throw error;
    }
  }

  useContainer(Container);
  const express = new ExpressConfig();
  const port = process.env.EXPRESS_PORT;
  const debugPort = process.env.EXPRESS_DEBUG;

  const server = express.app.listen(port, () => {
    if (process.env.NODE_ENV !== "test") {
      logger.info(`
    ------------------------------------------------------
     ${process.env.MICRO_SERVICE_NAME} Started! Express: http://localhost:${port}
     Health : http://localhost:${port}/ping
     Debugger: http://localhost:${port}/?ws=localhost:${port}&port=${debugPort}
    ------------------------------------------------------
    `);
    } else {
      logger.info(`node server up on port ${port}`);
    }
  });

  server.on("close", async () => {
    if (process.env.NODE_ENV !== "test") {
      logger.info("close db cnn...");
      await cnn.close();
      logger.info("db cnn closed");
      logger.info("server closed");
      process.exit();
    }
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.log(
      "System level exception at, Possibly Unhandled Rejection at: ",
      promise
    );
    console.log("REASON", reason);
  });

  process.on("SIGINT", () => {
    logger.info(
      "Got SIGINT (aka ctrl-c ). Graceful shutdown ",
      new Date().toISOString()
    );
    server.close((err: any) => {
      if (err) {
        console.error(err);
        process.exitCode = 1;
      }
      console.log("exit");
    });
  });

  process.on("SIGTERM", () => {
    logger.info(
      "Got SIGTERM (stop service). Graceful shutdown ",
      new Date().toISOString()
    );
    server.close((err: any) => {
      if (err) {
        console.error(err);
        process.exitCode = 1;
      }
      console.log("exit");
    });
  });
  return server;
};

export { app };
