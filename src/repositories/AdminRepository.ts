import { Service } from "typedi";
import { Repository, EntityRepository } from "typeorm";
import jwt from "jwt-simple";
import moment from "moment";
import { User } from "./../entities/User";
import { IJwtSession, UserType } from "./../models";
@Service()
@EntityRepository(User)
class AdminRepository extends Repository<User> {
  public findByEmail(email: string) {
    return this.findOne({ email });
  }

  public async isAdmin(admin: User): Promise<boolean> {
    const searchAdmin = await this.findOne({ email: admin.email });
    return searchAdmin !== undefined;
  }

  public async getToken(admin: User): Promise<string> {
    const now = moment();
    const payload: IJwtSession = {
      sub: admin.id,
      role: UserType.admin,
      iat: now.unix(),
      exp: now.add(14, "days").unix()
    };
    return jwt.encode(payload, process.env.SECRET!);
  }

  public async findByToken(token: string): Promise<User | undefined> {
    const session: IJwtSession = jwt.decode(token, process.env.SECRET!);
    const admin = await this.findOne({ id: session.sub });
    return admin;
  }
}

export { AdminRepository };
