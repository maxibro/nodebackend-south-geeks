import { Service } from "typedi";
import { Repository, EntityRepository } from "typeorm";
import jwt from "jwt-simple";
import { Action } from "@mardari/routing-controllers";
import moment from "moment";
import { User } from "./../entities/User";
import { IJwtSession, UserType } from "./../models";
@Service()
@EntityRepository(User)
class UserRepository extends Repository<User> {
  public findByEmail(email: string) {
    return this.findOne({ email });
  }

  public async isUser(user: User, userType: UserType): Promise<boolean> {
    const searchUser = await this.findOne({
      where: { email: user.email }
    });

    if (searchUser === undefined) {
      return false;
    } else {
      return true;
    }
  }
}

export { UserRepository };
