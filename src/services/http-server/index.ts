import {Service} from "typedi";
import {AppEnv} from "../env";
import fastify, {FastifyInstance, FastifyPluginCallback, FastifyPluginOptions, FastifyRegisterOptions} from 'fastify'
import {AppLogger} from "../logger";
import {IUser} from "../../models/user";
import {HydratedDocument} from "mongoose";
import fastifyCors from "fastify-cors";

declare module 'fastify' {
  export interface FastifyRequest {
    user?: HydratedDocument<IUser>
  }
}

@Service()
export class HttpServer {
  private fastifyInstance: FastifyInstance;

  constructor(private appEnv: AppEnv, private logger: AppLogger) {
    this.fastifyInstance = fastify();
    this.fastifyInstance.register(fastifyCors, {origin: true})
  }

  /**
   * Register a new controller as a fastify plugin
   * @param controller
   * @param options
   */
  public register(controller: FastifyPluginCallback<FastifyPluginOptions>, options: FastifyRegisterOptions<FastifyPluginOptions> = {}) {
    this.fastifyInstance.register(controller, options);

  }

  /**
   * Starts the server instance with the port specified in the env (HTTP_PORT)
   * TODO: Fix HTTP_HOST unused. Fastify typings are erroneous
   */
  public start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.fastifyInstance.listen(this.appEnv.get('HTTP_PORT'), (error, address) => {
        if (error) {
          this.logger.error('Could not start HTTP Rest Service', {error: error})
          return reject(error);
        }
        this.logger.info(`HTTP Server listening on ${address}`, {address});
        resolve(address);
      });
    })
  }

  /**
   * Returns the fastify instance used in the application
   */
  public getInstance(): FastifyInstance {
    return this.fastifyInstance;
  }

  public stop(): Promise<void> {
    return this.fastifyInstance.close();
  }
}
