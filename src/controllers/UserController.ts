import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  OnUndefined,
  UnauthorizedError,
  HttpError,
  InternalServerError,
  UseBefore,
  Res,
  QueryParam
} from "@mardari/routing-controllers";
import { Response } from "express";
import { User } from "./../entities/User";
import bcrypt from "bcrypt";

import { IUserToken, UserType, IUser } from "./../models";
import { Inject, Service } from "typedi";
import { UserService } from "./../services/UserService";
import { EnsureAuthenticated } from "./../middleware/common/EnsureAuthenticated";
import { EnsureAdmin } from "./../middleware/common/EnsureAdmin";
import { Pagination, IPaginationOptions } from "src/utils/paginator";

@Service()
@JsonController()
export class UserController {
  @Inject()
  private userService: UserService;

  @Post("/sign-up")
  public async signUp(@Body() user: any): Promise<IUserToken> {
    const isUser = await this.userService.isUser(user);
    if (isUser) {
      throw new HttpError(409, "The email account already exists."); // message is optional
    } else {
      user.role = UserType.regular;
      user.isActive = true;
      await this.saltPassword(user);
      const newUser = await this.userService.save(user);
      if (newUser !== undefined) {
        const userToken = await this.userService.getToken(user);
        return { token: userToken, role: UserType.regular };
      } else {
        throw new InternalServerError(
          `There was an error creating the account.`
        );
      }
    }
  }

  @HttpCode(200)
  @OnUndefined(404)
  @Post("/sign-in")
  public async signIn(@Body() userSignIn: any): Promise<IUserToken> {
    try {
      const user = await this.userService.findByEmail(userSignIn.email);

      if (!user || !user.isActive) {
        throw new UnauthorizedError(`User or password wrong.`);
      }

      const isUserPassword = await user.isUserPassword(userSignIn.password);
      if (!isUserPassword) {
        throw new UnauthorizedError(`User or password wrong!`);
      }
      const token = await this.userService.getToken(user);

      const userSessionToken: IUserToken = {
        token: token,
        role: user.role
      };
      return userSessionToken;
    } catch (err) {
      throw err;
    }
  }

  @Get("/users")
  @UseBefore(EnsureAuthenticated, EnsureAdmin)
  @HttpCode(200)
  @OnUndefined(404)
  public async getUsersPaginated(
    @Res() response: Response,
    @QueryParam("page", { required: false }) page: number = 0,
    @QueryParam("limit", { required: false }) limit: number = 10
  ): Promise<Pagination<IUser>> {
    const paginatorOptions: IPaginationOptions = {
      page,
      limit,
      route: `/users`
    };
    const users: Pagination<IUser> = await this.userService.getUsersPaginated(
      paginatorOptions,
      {
        role: UserType.regular
      }
    );
    return users;
  }

  @HttpCode(200)
  @UseBefore(EnsureAuthenticated, EnsureAdmin)
  @OnUndefined(404)
  @Put("/inactive-user/:id")
  public async put(@Param("id") userId: number): Promise<User> {
    const user = await this.userService.inactiveUser(userId);

    return user;
  }

  @Delete("/users/:id")
  public remove(@Param("id") id: number) {
    return "Removing user...";
  }

  private async saltPassword(user: User) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.salt = salt;
    user.password = hash;
  }
}
