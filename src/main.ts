import 'reflect-metadata';
import {Container, Service} from "typedi";
import {AppLogger} from './services/logger';

@Service()
class MainService {
  constructor(public loggerService: AppLogger) {
  }

  /**
   * Initialize the application.
   * Starts all services in sequence
   */
  start() {
    this.loggerService.info('Starting TPC Server');
  }
}

const mainService = Container.get(MainService);
mainService.start();
