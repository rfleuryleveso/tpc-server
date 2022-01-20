import {JSONSchemaType} from "ajv";

export interface IHttpLoginRequest {
  email: string;
  password: string;
}

export const loginSchema: JSONSchemaType<IHttpLoginRequest> = {
  type: "object",
  properties: {
    email: {type: "string"},
    password: {type: "string"},
  },
  required: ["email", "password"],
  additionalProperties: false,
}
