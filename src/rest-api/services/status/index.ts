import {RouteHandler} from "fastify";

interface IStatusService {
  index: RouteHandler
}

export class StatusService implements IStatusService {
  index: RouteHandler = (req, reply) => {
    reply.send(`Hello ${req.ip}`);
  }
}
