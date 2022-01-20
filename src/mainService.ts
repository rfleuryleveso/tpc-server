import {Service} from 'typedi';
import {AppLogger} from './services/logger';
import {AppEnv} from './services/env';
import {HttpServer} from './services/http-server';
import {RestApi} from './rest-api/RestApi';


@Service()
export class MainService {
  constructor(private loggerService: AppLogger, private envService: AppEnv, private httpServer: HttpServer, private restApi: RestApi) {
  }

  /**
   * Initialize the application.
   * Starts all services in sequence
   */
  async start() {
    const env = this.envService.get('NODE_ENV');
    this.loggerService.info(`Starting TPC Server, in ${env}`);
    this.restApi.registerHttp();
    await this.httpServer.start();
    // await this.noReplyMailer.testConnection();
  }

}
