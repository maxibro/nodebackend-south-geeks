import { Action } from "@mardari/routing-controllers";
import jwt from "jwt-simple";
import { IJwtSession } from "./../../models";
import moment from "moment";
import { UserService } from "@services/UserService";
import { Container } from "typedi";

const authorizationChecker = async (action: Action, roles: string[]) => {
  // here you can use request/response objects from action
  // also if decorator defines roles it needs to access the action
  // you can use them to provide granular access check
  // checker must return either boolean (true or false)
  // either promise that resolves a boolean value
  // demo code:

  if (!action.request.headers.authorization) {
    // you don't have auth header
    return false;
  }
  const token = action.request.headers.authorization.split(" ")[1];

  const payload: IJwtSession = jwt.decode(token, process.env.SECRET!);

  if (payload.exp <= moment().unix()) {
    // token expired
    return false;
  }
  const userService: UserService = Container.get("UserService");
  const user = await userService.getUserById(payload.sub);

  // const user = await getEntityManager().findOneByToken(User, token);
  // if (user && !roles.length) return true;
  // if (user && roles.find(role => user.roles.indexOf(role) !== -1)) return true;

  return false;
};

export { authorizationChecker };
