import {createTransport, Transporter} from 'nodemailer';
import {Service} from 'typedi';
import {AppEnv} from '../env';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {AppLogger} from '../logger';

export interface TPCEmail {
  recipient: string;
  message: string;
}

export type EmailContentCasContact = TPCEmail

export interface EmailContentCreateAccount extends TPCEmail {
  link: string,
}

export interface EmailContentVerification extends TPCEmail {
  tokenLink: string
}

@Service()
export class NoReplyMailer {
  private transport: Transporter<SMTPTransport.SentMessageInfo>;

  /**
   * setup smtp connection
   * @param appEnv env variable
   * @param appLogger
   */
  constructor(private appEnv: AppEnv, private appLogger: AppLogger) {
    this.transport = this.configTransport();
  }

  /**
   * @return Connection's state
   */
  async testConnection(): Promise<boolean> {
    return await this.transport.verify();
  }

  /**
   * configuration transporter
   * @private
   */
  configTransport(): Transporter<SMTPTransport.SentMessageInfo> {
    return createTransport({
      host: this.appEnv.get('SMTP_HOST') as string,
      port: this.appEnv.get('SMTP_PORT') as number,
      secure: this.appEnv.get('SMTP_PORT') === 465, // Only the 465 port is secured.
      auth: {
        user: this.appEnv.get('SMTP_USER') as string,
        pass: this.appEnv.get('SMTP_PASSWORD') as string,
      },
    });
  }

  /**
   * create message for creating new account
   * @param details
   */
  async createAccountMessage(details: EmailContentCreateAccount) {
    const message: Mail.Options = {
      from: this.appEnv.get('SMTP_EMAIL') as string,
      to: details.recipient,
      subject: '',
      text: details.message + details.link,
      html: '<b>' + details.message + details.link + '</b>',
    };
    await this.sendMail(message);
  }

  /**
   *
   * @param details
   */
  async casContactMessage(details: EmailContentCasContact) {
    const message: Mail.Options = {
      from: this.appEnv.get('SMTP_EMAIL') as string,
      to: details.recipient,
      subject: 'Vous êtes cas-contact',
      text: details.message,
      html: '<b>' + details.message + '</b>',
    };
    await this.sendMail(message);
  }


  /**
   *
   * @private
   * @param message
   */
  private sendMail(message: Mail.Options) {
    return this.transport.sendMail(message).then((result) => this.appLogger.info('Sent mail', result));
  }


}
