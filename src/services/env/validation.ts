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
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  SMTP_EMAIL: string;

  MONGODB_SRV: string;

  JWT_SECRET: string;

  PUBLIC_STORAGE_URL: string;
}

export const appEnvironmentVariablesSchema: JSONSchemaType<AppEnvironmentVariables> = {
  type: "object",
  properties: {
    NODE_ENV: {type: "string", enum: ["development", "production"], default: "development"},
    HTTP_HOST: {type: "string", default: "127.0.0.1"},
    HTTP_PORT: {type: "number", default: 8080},
    SMTP_HOST: {type: "string", default: "smtp.mailtrap.io"},
    SMTP_PORT: {type: "number", default: 2525},
    SMTP_USER: {type: "string", default: "29a3a165ff9c6a"},
    SMTP_PASSWORD: {type: "string", default: "0304029aad067f"},
    SMTP_EMAIL: {type: "string", default: "noreply@tplc.net"},

    MONGODB_SRV: {type: "string", default: "mongodb://localhost:27017/tpc"},

    JWT_SECRET: {type: "string", default: "t8m1idsJnyIsFCiTLJDaCxZwh3ghDEMyd9MUR1XR9Bo"},

    PUBLIC_STORAGE_URL: {type: "string"}
  },
  required: ["NODE_ENV"],
  additionalProperties: false,
}
