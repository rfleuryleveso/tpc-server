import {RouteHandler} from "fastify";
import {Service} from "typedi";

interface IUsersService {
  index: RouteHandler
}

@Service()
export class UsersService implements IUsersService {
  index: RouteHandler = (_req, reply) => {
    reply.send({success: true});
  }
}
