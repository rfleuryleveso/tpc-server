import {RouteHandler} from "fastify";
import {Service} from "typedi";

interface IStatusService {
  index: RouteHandler
}

@Service()
export class StatusService implements IStatusService {
  index: RouteHandler = (_req, reply) => {
    reply.send({success: true});
  }
}
