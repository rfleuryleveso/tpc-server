import { Service } from 'typedi';
import { AppLogger } from './services/logger';
import { AppEnv } from './services/env';
import { HttpServer } from './services/http-server';
import { RestApi } from './rest-api/RestApi';
import { NoReplyMailer } from './services/mailer';

@Service()
export class MainService {
  constructor(private loggerService: AppLogger, private envService: AppEnv, private httpServer: HttpServer, private restApi: RestApi, private noReplyMailer: NoReplyMailer) {
  }

  /**
   * Initialize the application.
   * Starts all services in sequence
   */
  async start() {
    const env = this.envService.get('NODE_ENV');
    this.loggerService.info(`Starting TPC Server, in ${env}`);
    this.restApi.registerHttp();
    this.noReplyMailer.createAccountMessage({
      recipientCreateAccount: 'pblinfo59@gmail.com',
      subjectCreateAccount: 'Creation de compte sur TPLC',
      messageCreateAccount: 'merci de créer votre compte TPLC avec le lien suivant : ',
      linkCreateAccount: 'zebi',
    });
    await this.httpServer.start();
  }

}
