import { createConnection, Connection, QueryRunner } from "typeorm";
import path from "path";

import { User } from "./entities/User";
import { Book } from "./entities/Book";
import { Order } from "./entities/Order";
import { Tag } from "./entities/Tag";

export async function getDbConnection() {
  const entities = [User, Book, Order, Tag];

  console.log("DATABASE_NAME", process.env.DATABASE_NAME);
  const DATABASE_NAME = process.env.DATABASE_NAME;

  let conn: Connection;

  const DATABASE_HOST = process.env.DATABASE_HOST;
  const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
  const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
  const DATABASE_DB = process.env.DATABASE_DB;

  console.log("DATABASE_HOST", process.env.DATABASE_HOST);
  console.log("DATABASE_USERNAME", process.env.DATABASE_USERNAME);
  console.log("DATABASE_DB", process.env.DATABASE_DB);

  const DATABASE_SYNCHRONIZE = process.env.DATABASE_SYNCHRONIZE === "true";
  const DATABASE_DROP_SCHEMA = process.env.DATABASE_DROP_SCHEMA === "true";

  const DATABASE_MIGRATIONS_RUN = true;
  // process.env.DATABASE_MIGRATIONS_RUN === "true";
  let queryRunner: null | QueryRunner = null;
  console.log("process.env.NODE_ENV", process.env.NODE_ENV);
  switch (process.env.NODE_ENV) {
    case "development":
      conn = await createConnection({
        name: "default",
        type: "mysql",
        host: DATABASE_HOST,
        port: 3306,
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
        database: DATABASE_DB,
        entities: entities,
        migrations: ["src/migration/**/*"],
        cli: {
          migrationsDir: "src/migration"
        },
        synchronize: DATABASE_SYNCHRONIZE,
        dropSchema: DATABASE_DROP_SCHEMA,
        migrationsRun: DATABASE_MIGRATIONS_RUN,
        logging: true,
        charset: "utf8mb4"
      });
      if (DATABASE_NAME) {
        queryRunner = conn.createQueryRunner();
        const result = await queryRunner.createDatabase(DATABASE_NAME, true);
      }
      break;
    case "production":
      conn = await createConnection({
        name: "default",
        type: "postgres",
        host: DATABASE_HOST,
        port: 5432,
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
        database: DATABASE_DB,
        entities: entities,
        migrations: ["src/migration/**/*"],
        cli: {
          migrationsDir: "src/migration"
        },
        synchronize: DATABASE_SYNCHRONIZE,
        dropSchema: DATABASE_DROP_SCHEMA,
        migrationsRun: DATABASE_MIGRATIONS_RUN
      });
    case "test":
      conn = await createConnection({
        name: DATABASE_NAME,
        type: "mysql",
        host: DATABASE_HOST,
        port: 3306,
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
        database: DATABASE_DB,
        entities: entities,
        migrations: ["src/migration/**/*"],
        cli: {
          migrationsDir: "src/migration"
        },
        synchronize: DATABASE_SYNCHRONIZE,
        dropSchema: DATABASE_DROP_SCHEMA,
        migrationsRun: DATABASE_MIGRATIONS_RUN,
        charset: "utf8mb4"
      });
      if (DATABASE_NAME) {
        queryRunner = conn.createQueryRunner();
        const result = await queryRunner.createDatabase(DATABASE_NAME, true);
        console.log(result);
      }
      break;
    default:
      conn = await createConnection({
        name: DATABASE_NAME,
        type: "sqlite",
        database: ":memory:",
        entities: entities,
        migrations: ["src/migration/**/*"],
        cli: {
          migrationsDir: "src/migration"
        },
        synchronize: DATABASE_SYNCHRONIZE,
        dropSchema: DATABASE_DROP_SCHEMA,
        migrationsRun: DATABASE_MIGRATIONS_RUN
      });
      break;
  }

  return conn;
}
