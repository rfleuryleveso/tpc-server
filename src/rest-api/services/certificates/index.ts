import {RouteHandler} from "fastify";
import {Service} from "typedi";
import {HydratedDocument} from "mongoose";
import {Certificate} from '../../../models'
import {ICertificate} from "../../../models/certificate";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ICertificateService {
}

@Service()
export class CertificatesService implements ICertificateService {
  index: RouteHandler = (_req, reply) => {
    reply.send({success: true});
  }

  async createUserCertificate(certificate: ICertificate): Promise<HydratedDocument<ICertificate>> {
    return Certificate.create(certificate);
  }

  async getCertificateById(certificateId: string): Promise<HydratedDocument<ICertificate>> {
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      throw new Error('Unknown certificate');
    }
    return certificate;
  }

  async getCertificates(): Promise<Array<HydratedDocument<ICertificate>>> {
    return Certificate.find();
  }

}
