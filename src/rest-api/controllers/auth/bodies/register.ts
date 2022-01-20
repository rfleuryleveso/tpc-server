import {JSONSchemaType} from "ajv";

export interface IHttpRegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
  birthdate: string;
  category: number;
}

export const registerSchema: JSONSchemaType<IHttpRegisterRequest> = {
  type: "object",
  properties: {
    name: {type: "string"},
    surname: {type: "string"},
    email: {type: "string"},
    password: {type: "string"},
    birthdate: {type: "string"},
    category: {type: "number"},
  },
  required: ["name", "surname", "email", "password", "birthdate", "category"],
  additionalProperties: false,
}
