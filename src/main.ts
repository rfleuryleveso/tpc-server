import 'reflect-metadata';
import {Container, Service} from "typedi";
import {AppLogger} from './services/logger';
import {AppEnv} from "./services/env";
import {HttpServer} from "./services/http-server";
import {RestApi} from "./rest-api/RestApi";

@Service()
class MainService {
  constructor(private loggerService: AppLogger, private envService: AppEnv, private httpServer: HttpServer, private restApi: RestApi) {
  }

  /**
   * Initialize the application.
   * Starts all services in sequence
   */
  start() {
    const env = this.envService.get('NODE_ENV');
    this.loggerService.info(`Starting TPC Server, in ${env}`);
    this.restApi.registerHttp();
    this.httpServer.start();
  }

}

const mainService = Container.get(MainService);
mainService.start();
