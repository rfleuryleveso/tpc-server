import {RouteHandler} from "fastify";
import {Service} from "typedi";
import {HydratedDocument} from "mongoose";
import user, {IUser} from "../../../models/user";
import {Certificate, User} from '../../../models'
import {ICertificate} from "../../../models/certificate";
import {IHttpUpdateUserRequest} from "../../controllers/users/bodies/updateUser";
import {NoReplyMailer} from "../../../services/mailer";
import {jsPDF} from "jspdf";
import readFilePromise from "../../../utils/readFilePromise";

interface IUsersService {
  index: RouteHandler
}

@Service()
export class UsersService implements IUsersService {
  constructor(private noReplyMail: NoReplyMailer) {
  }

  index: RouteHandler = (_req, reply) => {
    reply.send({success: true});
  }

  async getUserById(user: string): Promise<HydratedDocument<IUser>> {
    const userDocument = await User.findById(user);
    if (!userDocument) {
      throw new Error('Unknown user');
    }
    return userDocument;
  }

  async getUserCertificates(user: HydratedDocument<IUser> | string): Promise<Array<HydratedDocument<ICertificate>>> {
    if (typeof user === "string") {
      user = await this.getUserById(user);
    }
    return Certificate.where('user').equals(user._id).exec();
  }

  async updateUserImage(user: HydratedDocument<IUser> | string, image?: Buffer): Promise<HydratedDocument<IUser>> {
    if (typeof user === "string") {
      user = await this.getUserById(user);
    }
    if (!image) {
      user.avatar = `https://avatars.dicebear.com/api/bottts/${user._id}.svg`;
      await user.save();
    } else {
      // upload avatar
    }

    return user;
  }

  async updateUser(user: HydratedDocument<IUser> | string, userData?: IHttpUpdateUserRequest): Promise<HydratedDocument<IUser>> {
    if (typeof user === "string") {
      user = await this.getUserById(user);
    }
    user.update(userData);
    await user.save();
    return user;
  }

  async deleteUser(user: HydratedDocument<IUser> | string): Promise<HydratedDocument<IUser>> {
    if (typeof user === "string") {
      user = await this.getUserById(user);
    }
    await user.delete();
    return user;
  }

  async getUsers(): Promise<Array<HydratedDocument<IUser>>> {
    return user.find().exec();
  }

  async sendContactCaseEmails(user: HydratedDocument<IUser>, emails: Array<string>, certificate: HydratedDocument<ICertificate>) {
    await this.noReplyMail.casContactMessage({
      recipient: emails.join(','),
      message: `${user.name} ${user.surname} vous a déclaré en tant que cas-contact. Dernier test en date: ${certificate.date.toLocaleString()}, résultat: ${certificate.metadata.RESULT === 'positive' ? 'positif' : 'négatif'}`,
    });
  }

  async genCertificatePdf(user: HydratedDocument<IUser> | string): Promise<Buffer> {
    if (typeof user === "string") {
      user = await this.getUserById(user);
    }
    const doc = new jsPDF({format: 'a4', unit: 'pt'});
    doc.addImage({
      imageData: await readFilePromise('./storage/logo.png'),
      format: 'PNG',
      x: 10,
      y: 10,
      width: 96,
      height: 96
    });
    doc.text(`Certificate for ${user.name} ${user.surname}`, 10 + 96 + 16, 10 + 48);
    doc.setFontSize(13);
    doc.setTextColor('red');
    doc.text('POSITIVE', 595 - 80, 10 + 48);
    doc.setTextColor('black');
    doc.text(`Mr. or Ms. ${user.surname}, you are now eligible for a CovidPass. You can use this document as a proof.`, 10, 10 + 96 + 16, {
      maxWidth: 595 - 10 - 10,
    });
    return Buffer.from(doc.output('arraybuffer'));
  }
}
