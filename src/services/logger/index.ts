import {Service} from 'typedi';
import winston, {createLogger, format, transports} from "winston";

@Service()
export class AppLogger extends (createLogger as unknown as winston.Logger) {
  constructor() {
    const configuration: winston.LoggerOptions = {
      level: 'info',
      format: format.json(),
      transports: [
        new transports.File({filename: 'storage/application.log'}),
      ],
    }
    // If in development, add a coloured output
    if (process.env.NODE_ENV === 'development') {
      (configuration.transports as winston.transport[]).push(new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        ),
      }))
    }

    super(configuration)
  }
}
