import {Service} from 'typedi';
import winston, {createLogger, format, transports} from "winston";
import {AppEnv} from "../env";

@Service()
export class AppLogger extends (createLogger as unknown as winston.Logger) {
  constructor(appEnv: AppEnv) {
    super({
      level: 'info',
      format: format.json(),
      transports: [
        new transports.File({filename: 'storage/application.log'}),
      ],
    })

    // If in development, add a coloured output
    if (appEnv.get('NODE_ENV') === 'development') {
      this.add(new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        ),
      }))
    }

  }
}
