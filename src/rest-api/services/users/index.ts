import {RouteHandler} from "fastify";
import {Service} from "typedi";
import {HydratedDocument} from "mongoose";
import user, {IUser} from "../../../models/user";
import {Certificate, User} from '../../../models'
import {CertificateType, ICertificate} from "../../../models/certificate";
import {IHttpUpdateUserRequest} from "../../controllers/users/bodies/updateUser";
import {NoReplyMailer} from "../../../services/mailer";
import {DateTime} from "luxon";
import {decodeUTF8, encodeBase64} from "tweetnacl-util";
import {sign} from "tweetnacl";
import keyPair from "../../../signatureKey";

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

  async getUserByEmail(email: string): Promise<HydratedDocument<IUser>> {
    const user = await User.findOne({email}).exec();
    if (!user) {
      throw new Error('Unknown user');
    }
    return user;
  }

  async getUserCertificates(user: HydratedDocument<IUser> | string): Promise<Array<HydratedDocument<ICertificate>>> {
    if (typeof user === "string") {
      user = await this.getUserById(user);
    }
    return Certificate.where('email').equals(user.email).exec();
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

  async sendContactCaseEmails(user: HydratedDocument<IUser>, emails: Array<string>, _certificate: HydratedDocument<ICertificate>) {
    await this.noReplyMail.casContactMessage({
      recipient: emails.join(','),
      name: user.name,
      surname: user.surname
    });
  }

  async hasPass(user: HydratedDocument<IUser>): Promise<boolean> {
    const certificates = await this.getUserCertificates(user);

    const vaccinesCertificates = certificates.filter(certificate => certificate.type === CertificateType.VACCINE);
    const testsCertificates = certificates.filter(certificates => certificates.type === CertificateType.TEST);

    if (vaccinesCertificates.length < 2) {
      // The user is not vaccinated
      if (testsCertificates.length === 0) {
        return false;
      } else {
        const twoDaysAgo = DateTime.now().minus({day: 2});
        const recentCertificates = testsCertificates
          .filter(certificate => DateTime.fromJSDate(certificate.date) > twoDaysAgo)
          .sort((certificateA, certificateB) => certificateA.date.getTime() - certificateB.date.getTime());
        if (recentCertificates.length === 0) {
          return false;
        } else {
          return (recentCertificates[0].metadata.RESULT ?? 'positive') === 'negative';
        }
      }
    } else {
      // The user is vaccinated
      if (testsCertificates.length === 0) {
        return true;
      } else {
        const twoDaysAgo = DateTime.now().minus({day: 2});
        const recentCertificates = testsCertificates
          .filter(certificate => DateTime.fromJSDate(certificate.date) > twoDaysAgo)
          .sort((certificateA, certificateB) => certificateA.date.getTime() - certificateB.date.getTime());
        if (recentCertificates.length === 0) {
          return true;
        } else {
          return (recentCertificates[0].metadata.RESULT ?? 'positive') === 'negative';
        }
      }
    }
  }

  async genPassToken(user: HydratedDocument<IUser>): Promise<string> {
    const sigData = {
      _id: user._id,
      hasPass: await this.hasPass(user),
      iat: DateTime.now().toMillis(),
    }
    const messageUint8 = decodeUTF8(JSON.stringify(sigData));
    const signedMessage = sign(messageUint8, keyPair.secretKey);

    const signedBase64Message = encodeBase64(signedMessage);
    return signedBase64Message;
  }

}
