/**
 * All possibles keys and values for env
 */
import {JSONSchemaType} from "ajv";

export class AppEnvironmentVariables {
  NODE_ENV: 'development' | 'production';
}

export const appEnvironmentVariablesSchema: JSONSchemaType<AppEnvironmentVariables> = {
  type: "object",
  properties: {
    NODE_ENV: {type: "string", enum: ["development", "production"]},
  },
  required: ["NODE_ENV"],
  additionalProperties: false,
}
