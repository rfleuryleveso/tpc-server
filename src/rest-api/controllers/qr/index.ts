import {IController} from "../index";
import {Service} from "typedi";
import {FastifyPluginCallback, FastifyPluginOptions, RouteHandler} from "fastify";
import {UsersService} from "../../services/users";
import {CertificateType} from "../../../models/certificate";
import {DateTime} from 'luxon'

@Service()
export class QrController implements IController {
  constructor(private usersService: UsersService) {
    this.checkQr = this.checkQr.bind(this);
  }

  /**
   * Register the routes of the controller
   * @param instance Fastify instance
   * @param _opts Options of the instance
   * @param done Done callback, to pass control back to upper stack
   */
  register: FastifyPluginCallback<FastifyPluginOptions> = (instance, _opts, done) => {
    instance.get('/:id', this.checkQr)


    done();
    return null;
  }

  checkQr: RouteHandler = async (request, reply) => {
    const user = await this.usersService.getUserById((request.params as { id: string }).id);
    if (!user) {
      reply.status(404).send({
        success: false,
        error: 'User not found'
      })
    }

    const certificates = await this.usersService.getUserCertificates(user);

    const vaccinesCertificates = certificates.filter(certificate => certificate.type === CertificateType.VACCINE);
    const testsCertificates = certificates.filter(certificates => certificates.type === CertificateType.TEST);

    if (vaccinesCertificates.length < 2) {
      // The user is not vaccinated
      if (testsCertificates.length === 0) {
        return reply.send({success: true, hasPass: false, reason: 'unvaccinated'});
      } else {
        const twoDaysAgo = DateTime.now().minus({day: 2});
        const recentCertificates = testsCertificates
          .filter(certificate => DateTime.fromJSDate(certificate.date) > twoDaysAgo)
          .sort((certificateA, certificateB) => certificateA.date.getTime() - certificateB.date.getTime());
        if (recentCertificates.length === 0) {
          return reply.send({success: true, hasPass: false, reason: 'no recent certificates'});
        } else {
          if ((recentCertificates[0].metadata.TEST_RESULT ?? 'positive') === 'negative') {
            return reply.send({success: true, hasPass: true});
          } else {
            return reply.send({success: true, hasPass: false, reason: 'last certificate is positive'});
          }
        }
      }
    } else {
      // The user is vaccinated
      if (testsCertificates.length === 0) {
        return reply.send({success: true, hasPass: true});
      } else {
        const twoDaysAgo = DateTime.now().minus({day: 2});
        const recentCertificates = testsCertificates
          .filter(certificate => DateTime.fromJSDate(certificate.date) > twoDaysAgo)
          .sort((certificateA, certificateB) => certificateA.date.getTime() - certificateB.date.getTime());
        if (recentCertificates.length === 0) {
          return reply.send({success: true, hasPass: true});
        } else {
          if ((recentCertificates[0].metadata.TEST_RESULT ?? 'positive') === 'negative') {
            return reply.send({success: true, hasPass: true});
          } else {
            return reply.send({success: true, hasPass: false, reason: 'last certificate is positive'});
          }
        }
      }
    }

  }

}


