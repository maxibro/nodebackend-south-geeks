import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import jwt from "jwt-simple";
import { UserRepository } from "./../repositories";
import { User } from "./../entities/User";
import { IJwtSession, UserType, IUser } from "./../models";
import moment = require("moment");
import { IPaginationOptions, Pagination, paginate } from "./../utils/paginator";
import { getRepository } from "typeorm";
import { NotFoundError } from "@mardari/routing-controllers";

@Service()
export class UserService {
  @OrmRepository()
  private userRepository: UserRepository;

  public async getUsersPaginated(
    paginationOptions: IPaginationOptions,
    filter: {
      role: UserType;
    }
  ): Promise<Pagination<IUser>> {
    const result = await paginate<User>(
      getRepository("User"),
      paginationOptions,
      {
        where: { role: filter.role },
        order: { name: "ASC", email: "ASC" },
        relations: ["orders"]
      }
    );
    return result;
  }

  public async findByEmail(email: string) {
    return this.userRepository.findOne({
      select: ["id", "email", "password", "role", "salt", "isActive"],
      where: [{ email: email }]
    });
  }

  public async save(user: User) {
    return this.userRepository.save(user);
  }

  public async inactiveUser(userId: number) {
    const user: User | undefined = await this.userRepository.findOne(userId);

    if (user === undefined) {
      throw new NotFoundError(`The user was not found.`);
    }
    user.isActive = false;
    return this.userRepository.save(user);
  }

  public async isUser(user: User): Promise<boolean> {
    const searchUser = await this.userRepository.findOne({
      where: { email: user.email }
    });

    if (searchUser === undefined) {
      return false;
    } else {
      return true;
    }
  }

  public async getToken(user: User): Promise<string> {
    const now = moment();
    const payload: IJwtSession = {
      sub: user.id,
      role: user.role,
      iat: now.unix(),
      exp: now.add(14, "days").unix()
    };
    return jwt.encode(payload, process.env.SECRET!);
  }

  public async getUserById(userId: number): Promise<User | undefined> {
    const user: User | undefined = await this.userRepository.findOne({
      where: { id: userId }
    });
    return user;
  }

  public async findByToken(token: string): Promise<User | undefined> {
    const session: IJwtSession = jwt.decode(token, process.env.SECRET!);
    const customer = await this.userRepository.findOne({ id: session.sub });
    return customer;
  }
}
