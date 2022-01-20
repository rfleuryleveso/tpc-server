import {JSONSchemaType} from "ajv";
import {CertificateType} from "../../../../models/certificate";

export interface IHttpAddCertificateRequest {
  email: string;
  type: CertificateType;
  metadata: Record<string, string>
}

export const addCertificateRequest: JSONSchemaType<IHttpAddCertificateRequest> = {
  type: "object",
  properties: {
    email: {type: "string"},
    type: {type: "number", enum: [0, 1]},
    metadata: {type: "object", required: []}
  },
  required: ["email", "type"],
  additionalProperties: false,
}
