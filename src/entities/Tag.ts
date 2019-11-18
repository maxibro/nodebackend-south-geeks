import { IsNotEmpty } from "class-validator";
import { Entity, Column, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

import { ITag, IBook } from "./../models";

import { Book } from "./Book";

@Entity()
class Tag implements ITag {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    name: "name",
    nullable: false,
    type: "varchar",
    length: 254
  })
  @IsNotEmpty()
  public name: string;

  @ManyToMany(
    type => Book,
    book => book.tags
  )
  public books: IBook[];
}

export { Tag };
