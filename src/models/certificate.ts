import {Model, Schema} from 'mongoose';
import {Container} from "typedi";
import {Database} from "../services/database";

export enum CertificateType {
  VACCINE,
  TEST
}

export interface ICertificate {
  email?: string;

  type: CertificateType;
  date: Date,
  metadata: Record<string, string>,
}

export interface ICertificateWithSignature extends ICertificate {
  signature: string;
}

export const CertificateSchema: Schema = new Schema<ICertificate>({
  email: Schema.Types.String,
  type: Schema.Types.Number,
  date: Schema.Types.Date,
  metadata: Schema.Types.Mixed
}, {
  collection: 'certificates'
});

const database = Container.get(Database);
const CertificateModel = database.connection.model('Certificate', CertificateSchema) as Model<ICertificate>;

export default CertificateModel;
