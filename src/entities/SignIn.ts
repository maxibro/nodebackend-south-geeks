import { IsNotEmpty, IsEmail, MinLength, MaxLength } from "class-validator";
import { IRegularSignIn } from "../models";

class SignIn implements IRegularSignIn {
  @IsEmail(undefined, {
    message: "Invalid email format"
  })
  @IsNotEmpty({
    message: "Email is required"
  })
  public email: string;

  @MaxLength(30, { message: "Max lenght 30" })
  @MinLength(6, { message: "Min lenght 6" })
  @IsNotEmpty({
    message: "Password is required"
  })
  public password: string;
}

export { SignIn };
