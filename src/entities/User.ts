import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsIn,
  IsBoolean
} from "class-validator";
import {
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index
} from "typeorm";
import bcrypt from "bcrypt";
import { IUser, UserType, IOrder } from "./../models";
import { Order } from "./Order";

@Entity()
@Index("IDX_UQ__PROVIDER__EMAIL", ["email"], { unique: true })
class User implements IUser {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ nullable: false, type: "varchar", length: 254 })
  @IsEmail(undefined, {
    message: "Incorrect email format"
  })
  @IsNotEmpty({
    message: "Email is required"
  })
  public email: string;

  @Column({ select: false, nullable: false, type: "varchar", length: 30 })
  @MaxLength(30, {
    message: "Password could not have more than 30 characters."
  })
  @MinLength(6, { message: "Password could not have less than 6 characters." })
  @IsNotEmpty({
    message: "Password is required"
  })
  public password: string;

  @Column({ nullable: false, type: "varchar", length: 254 })
  @IsNotEmpty({
    message: "Name is required"
  })
  public name: string;

  @Column({ nullable: true, type: "varchar", length: 10 })
  @IsIn([UserType.regular, UserType.admin])
  public role: UserType;

  @Column({ nullable: false, primary: false, type: "tinyint", precision: 1 })
  @IsBoolean()
  @IsNotEmpty()
  public isActive: boolean;

  @Column({ select: false, nullable: true, type: "varchar", length: 254 })
  public salt: string;

  @OneToMany(
    type => Order,
    order => order.user,
    { onDelete: "CASCADE" }
  )
  public orders?: IOrder[];

  public async isUserPassword(passwordToCheck: string): Promise<boolean> {
    const hashToCompare = await bcrypt.hash(passwordToCheck, this.salt);
    return this.password === hashToCompare;
  }
}

export { User };
