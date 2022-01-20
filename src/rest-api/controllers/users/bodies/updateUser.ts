import {JSONSchemaType} from "ajv";

export interface IHttpUpdateUserRequest {
  name: string;
  surname: string;
  email: string;
  birthdate: string;
  category: number;
}

export const updateUserSchema: JSONSchemaType<IHttpUpdateUserRequest> = {
  type: "object",
  properties: {
    name: {type: "string"},
    surname: {type: "string"},
    email: {type: "string", format: "email"},
    birthdate: {type: "string"},
    category: {type: "number"},
  },
  required: ["name", "surname", "email", "birthdate", "category"],
  additionalProperties: false,
}
