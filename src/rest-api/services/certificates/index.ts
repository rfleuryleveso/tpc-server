import {RouteHandler} from "fastify";
import {Service} from "typedi";
import {HydratedDocument} from "mongoose";
import {Certificate} from '../../../models'
import {CertificateType, ICertificate, ICertificateWithSignature} from "../../../models/certificate";
import {IUser} from "../../../models/user";
import {jsPDF} from "jspdf";
import readFilePromise from "../../../utils/readFilePromise";
import {DateTime} from "luxon";

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


  async genCertificatePdf(user: HydratedDocument<IUser>, certificate: HydratedDocument<ICertificate>): Promise<Buffer> {
    const doc = new jsPDF({format: 'a4', unit: 'pt'});
    doc.addImage({
      imageData: await readFilePromise('./storage/logo.png'),
      format: 'PNG',
      x: 10,
      y: 10,
      width: 96,
      height: 96
    });

    if (certificate.type === CertificateType.VACCINE) {
      return this.genVaccinationCertificate(user, certificate, doc);
    } else {
      return this.genTestCertificate(user, certificate, doc);
    }
  }

  async genVaccinationCertificate(user: HydratedDocument<IUser>, certificate: HydratedDocument<ICertificate>, doc: jsPDF): Promise<Buffer> {
    doc.text(`Certificat de vaccination`, 10 + 96 + 16, 10 + 48);
    doc.setFontSize(13);
    doc.setTextColor('green');
    doc.text('VACCIN', 595 - 80, 10 + 48);
    doc.setTextColor('black');
    doc.text(`Ce certificat prouve que M. ou Mme. ${user.name} ${user.surname} à reçu une dose du vaccin ${certificate.metadata.LAB}, le ${DateTime.fromJSDate(certificate.date).setLocale('fr').toLocaleString(DateTime.DATETIME_FULL)}. Ce certificat à été généré le ${DateTime.now().setLocale('fr').toLocaleString(DateTime.DATETIME_FULL)}`, 10, 10 + 96 + 16, {
      maxWidth: 595 - 10 - 10,
    });

    return Buffer.from(doc.output('arraybuffer'));
  }

  async genTestCertificate(user: HydratedDocument<IUser>, certificate: HydratedDocument<ICertificate>, doc: jsPDF): Promise<Buffer> {
    doc.text(`Certificat de test`, 10 + 96 + 16, 10 + 48);
    doc.setFontSize(13);
    if (certificate.metadata.RESULT === 'positive') {
      doc.setTextColor('red');
      doc.text('POSITIF', 595 - 80, 10 + 48);
    } else {
      doc.setTextColor('green');
      doc.text('NEGATIF', 595 - 80, 10 + 48);
    }
    doc.setTextColor('black');
    doc.text(`Ce certificat prouve que M. ou Mme. ${user.name} ${user.surname} à été ${certificate.metadata.RESULT === 'positive' ? 'positif' : 'négatif'} à la covid, le ${DateTime.fromJSDate(certificate.date).setLocale('fr').toLocaleString(DateTime.DATETIME_FULL)}. Ce certificat à été généré le ${DateTime.now().setLocale('fr').toLocaleString(DateTime.DATETIME_FULL)}`, 10, 10 + 96 + 16, {
      maxWidth: 595 - 10 - 10,
    });

    return Buffer.from(doc.output('arraybuffer'));
  }

  async signCertificate(certificate: HydratedDocument<ICertificate>): Promise<ICertificateWithSignature> {
    return {...certificate.toJSON(), signature: ''};
  }
}
