import 'reflect-metadata';
import {Container, Service} from "typedi";
import {AppLogger} from './services/logger';
import {AppEnv} from "./services/env";
import {HttpServer} from "./services/http-server";
import statusController from "./rest-api/controllers/status";

@Service()
class MainService {
  constructor(public loggerService: AppLogger, public envService: AppEnv, public httpServer: HttpServer) {
  }

  /**
   * Initialize the application.
   * Starts all services in sequence
   */
  start() {
    const env = this.envService.get('NODE_ENV')
    this.loggerService.info(`Starting TPC Server, in ${env}`);
    this.httpServer.register(statusController);
    this.httpServer.start();
  }
}

const mainService = Container.get(MainService);
mainService.start();
