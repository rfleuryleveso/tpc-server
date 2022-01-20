import {FastifyPluginCallback, FastifyPluginOptions} from "fastify";

export interface IController {
  register: FastifyPluginCallback<FastifyPluginOptions>
}

