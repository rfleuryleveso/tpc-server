import { createTransport, Transporter } from 'nodemailer';
import { Service } from 'typedi';
import { AppEnv } from '../env';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppLogger } from '../logger';

export interface EmailContentCasContact {
  subjectCasContact: string,
  messageCasContact: string,
  recipientCasContact: string
}

export interface EmailContentCreateAccount {
  subjectCreateAccount: string,
  messageCreateAccount: string,
  linkCreateAccount: string,
  recipientCreateAccount: string
}

export interface EmailContentVerification {
  subjectVerification: string,
  messageVerification: string,
  recipientVerification: string,
  tokenVerificationLink: string
}


@Service()
export class NoReplyMailer {


  private transporter: Transporter<SMTPTransport.SentMessageInfo>;


  /**
   * setup smtp connection
   * @param appEnv env variable
   * @param appLogger
   */
  constructor(private appEnv: AppEnv, private appLogger: AppLogger) {

    this.transporter = this.configTransporter();
  }

  /**
   *
   * @private
   * @param message
   */
  private sendMail(message: Mail.Options) {

    return this.transporter.sendMail(message).then((result) => this.appLogger.info('Sent mail', result));
  }

  /**
   * @return Promise<boolean> connection state
   */
  async testConnection(): Promise<boolean> {
    return await this.transporter.verify();
  }

  /**
   * configuration transporter
   * @private
   */
  configTransporter(): Transporter<SMTPTransport.SentMessageInfo> {
    return createTransport({
      host: this.appEnv.get('SMTP_HOST') as string,
      port: this.appEnv.get('SMTP_PORT') as number,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.appEnv.get('SMTP_MAIL') as string,
        pass: this.appEnv.get('SMTP_PASSWORD') as string,
      },
    });
  }

  /**
   * error message when something went wrong
   * @protected
   */
  protected errorMessage() {
    console.log('an error occured please verify recipient email address.');
  }

  /**
   * create message for creating new account
   * @param details
   */
  async createAccountMessage(details: EmailContentCreateAccount) {
    const message: Mail.Options = {
      from: this.appEnv.get('SMTP_MAIL') as string,
      to: details.recipientCreateAccount,
      subject: details.subjectCreateAccount,
      text: details.messageCreateAccount + details.linkCreateAccount,
      html: '<b>' + details.messageCreateAccount + details.linkCreateAccount + '</b>',
    };

    await this.sendMail(message);

  }

  /**
   *
   * @param details
   */
  async casContactMessage(details: EmailContentCasContact) {
    const message: Mail.Options = {
      from: this.appEnv.get('SMTP_MAIL') as string,
      to: details.recipientCasContact,
      subject: details.subjectCasContact,
      text: details.messageCasContact,
      html: '<b>' + details.messageCasContact + '</b>',
    };
    await this.sendMail(message);
  }

  async emailVerification(details: EmailContentVerification) {
    const message: Mail.Options = {
      from: this.appEnv.get('SMTP_MAIL') as string,
      to: details.recipientVerification,
      subject: details.subjectVerification,
      text: details.messageVerification + details.tokenVerificationLink,
      html: '<b>' + details.messageVerification + details.tokenVerificationLink + '</b>',
    };
    await this.sendMail(message);
  }


}
