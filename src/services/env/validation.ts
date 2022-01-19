/**
 * All possibles keys and values for env
 */
import {JSONSchemaType} from "ajv";

export class AppEnvironmentVariables {
  NODE_ENV: 'development' | 'production';

  HTTP_HOST: string;
  HTTP_PORT: number;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_MAIL: string;
  SMTP_PASSWORD: string;
}

export const appEnvironmentVariablesSchema: JSONSchemaType<AppEnvironmentVariables> = {
  type: "object",
  properties: {
    NODE_ENV: {type: "string", enum: ["development", "production"], default: "development"},
    HTTP_HOST: {type: "string", default: "127.0.0.1"},
    HTTP_PORT: {type: "number", default: 8080},
    SMTP_HOST: {type: "string", default: "smtp.gmail.com"},
    SMTP_PORT: {type: "number", default: 587},
    SMTP_MAIL: {type: "string", default: "noreply.tplc@gmail.com"},
    SMTP_PASSWORD: {type: "string", default:"noreply59*"}
  },
  required: ["NODE_ENV"],
  additionalProperties: false,
}
