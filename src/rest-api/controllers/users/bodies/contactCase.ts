import {JSONSchemaType} from "ajv";

export interface IHttpAddContactCase {
  emails: Array<string>;
}

export const addContactCase: JSONSchemaType<IHttpAddContactCase> = {
  type: "object",
  properties: {
    emails: {type: "array", items: {type: "string", format: "email"}},
  },
  required: ["emails"],
  additionalProperties: false,
}
