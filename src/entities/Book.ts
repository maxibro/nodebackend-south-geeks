import {
  Entity,
  Column,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  JoinTable
} from "typeorm";
import { IsNotEmpty, IsBoolean } from "class-validator";
import { IBook, IOrder, ITag } from "./../models";
import { Order } from "./Order";
import { Tag } from "./Tag";

@Entity()
@Unique("IDX_UQ__BOOK__AUTHOR__NAME", ["author", "name"])
class Book implements IBook {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ nullable: false, type: "varchar", length: 254 })
  @IsNotEmpty({
    message: "Name is required"
  })
  public name: string;

  @Column({ nullable: false, type: "varchar", length: 254 })
  @IsNotEmpty({
    message: "Author is required"
  })
  public author: string;

  @Column({
    name: "price",
    nullable: false,
    type: "decimal",
    precision: 10,
    scale: 2
  })
  @IsNotEmpty()
  public price: number;

  @Column({ nullable: false, primary: false, type: "tinyint", precision: 1 })
  @IsBoolean()
  @IsNotEmpty()
  public isActive: boolean;

  @Column({ nullable: false, type: "varchar", length: 254 })
  @IsNotEmpty()
  public txtFileName: string;

  @Column({ nullable: false, type: "varchar", length: 254 })
  @IsNotEmpty()
  public txtFileUrl: string;

  @ManyToMany(
    type => Order,
    order => order.books
  )
  public orders: IOrder[];

  @ManyToMany(
    type => Tag,
    tag => tag.books,
    {
      cascade: ["insert", "update"]
    }
  )
  @JoinTable({ name: "book_tag" })
  public tags: ITag[];
}

export { Book };
