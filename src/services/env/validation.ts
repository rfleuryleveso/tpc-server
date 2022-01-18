/**
 * All possibles keys and values for env
 */
import {JSONSchemaType} from "ajv";

export class AppEnvironmentVariables {
  NODE_ENV: 'development' | 'production';

  HTTP_HOST: string;
  HTTP_PORT: number;

  MONGODB_SRV: string;
}

export const appEnvironmentVariablesSchema: JSONSchemaType<AppEnvironmentVariables> = {
  type: "object",
  properties: {
    NODE_ENV: {type: "string", enum: ["development", "production"], default: "development"},
    HTTP_HOST: {type: "string", default: "127.0.0.1"},
    HTTP_PORT: {type: "number", default: 8080},
    MONGODB_SRV: {type: "string", default: "mongodb://localhost:27017/tpc"},
  },
  required: ["NODE_ENV"],
  additionalProperties: false,
}
