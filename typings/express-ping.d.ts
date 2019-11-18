import { RequestHandler } from "express";
declare module "express-ping" {  
  const health: {
    ping: () => RequestHandler;
  };
}
export default health;
