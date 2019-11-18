import { IsNotEmpty, IsDateString } from "class-validator";
import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  PrimaryGeneratedColumn
} from "typeorm";

import { IOrder, IBook, IUser } from "./../models";
import { User } from "./../entities/User";
import { Book } from "./Book";

@Entity("request")
class Order implements IOrder {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    name: "order_date",
    nullable: false,
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP"
  })
  @IsDateString()
  @IsNotEmpty()
  public orderDate: Date;

  @Column({
    name: "amount",
    nullable: false,
    type: "decimal",
    precision: 10,
    scale: 2
  })
  @IsNotEmpty()
  public amount: number;

  @Column({ nullable: false, primary: false })
  public userId: number;

  @ManyToOne(
    type => User,
    user => user.orders,
    {
      onDelete: "RESTRICT",
      nullable: false,
      primary: false
    }
  )
  @JoinColumn({
    name: "userId",
    referencedColumnName: "id"
  })
  public user: IUser;

  @ManyToMany(
    type => Book,
    book => book.orders,
    { cascade: true }
  )
  @JoinTable({ name: "order_book" })
  public books: IBook[];
}

export { Order };
