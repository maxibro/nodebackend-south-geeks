import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema21573398288453 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      "CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(254) NOT NULL, `password` varchar(100) NOT NULL, `name` varchar(254) NOT NULL, `role` varchar(10) NOT NULL, `salt` varchar(300) NOT NULL,  `isActive` tinyint(1) NOT NULL, UNIQUE INDEX `IDX_UQ__PROVIDER__EMAIL` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      "CREATE TABLE `order` (`id` int NOT NULL AUTO_INCREMENT, `order_date` datetime NOT NULL, `amount` decimal(10,2) NOT NULL, `customerId` int NOT NULL, `userId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      "CREATE TABLE `book` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(254) NOT NULL, `author` varchar(254) NOT NULL, `price` decimal(10,2) NOT NULL, `keywords` varchar(254) NULL, `isActive` tinyint(1) NOT NULL, `txtFileUrl` varchar(254) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      "CREATE TABLE `order_book` (`id` int NOT NULL AUTO_INCREMENT, `orderId` int NOT NULL, `bookId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      "ALTER TABLE `order` ADD CONSTRAINT `FK_caabe91507b3379c7ba73637b84` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT"
    );
    await queryRunner.query(
      "ALTER TABLE `order_book` ADD CONSTRAINT `FK_02dfc1a41521c41fb21ff0749a8` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE RESTRICT"
    );
    await queryRunner.query(
      "ALTER TABLE `order_book` ADD CONSTRAINT `FK_dc3b1731d65c319e954cb621c1b` FOREIGN KEY (`bookId`) REFERENCES `book`(`id`) ON DELETE CASCADE"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
