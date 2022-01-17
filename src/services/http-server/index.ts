import {Service} from "typedi";
import {AppEnv} from "../env";
import fastify, {FastifyInstance, FastifyPluginCallback, FastifyPluginOptions, FastifyRegisterOptions} from 'fastify'
import {AppLogger} from "../logger";


@Service()
export class HttpServer {
  private fastifyInstance: FastifyInstance;

  constructor(private appEnv: AppEnv, private logger: AppLogger) {
    this.fastifyInstance = fastify();
  }

  public register(controller: FastifyPluginCallback<FastifyPluginOptions>, options: FastifyRegisterOptions<FastifyPluginOptions> = {}) {
    this.fastifyInstance.register(controller, options);
  }

  /**
   * Starts the server instance with the port specified in the env (HTTP_PORT)
   * TODO: Fix HTTP_HOST unused. Fastify typings are erroneous
   */
  public start() {
    this.fastifyInstance.listen(this.appEnv.get('HTTP_PORT'), (error, address) => {
      if (error) {
        this.logger.error('Could not start HTTP Rest Service', {error: error})
      }
      this.logger.info(`HTTP Server listening on ${address}`, {address});
    });
  }
}
