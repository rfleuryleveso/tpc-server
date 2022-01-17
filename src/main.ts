import 'reflect-metadata';
import {Container, Service} from "typedi";
import {AppLogger} from './services/logger';
import {AppEnv} from "./services/env";

@Service()
class MainService {
  constructor(public loggerService: AppLogger, public envService: AppEnv) {
  }

  /**
   * Initialize the application.
   * Starts all services in sequence
   */
  start() {
    const env = this.envService.get('NODE_ENV')
    this.loggerService.info(`Starting TPC Server, in ${env}`);
  }
}

const mainService = Container.get(MainService);
mainService.start();
