import {IController} from "../index";
import {Service} from "typedi";
import {FastifyPluginCallback, FastifyPluginOptions, RouteHandler} from "fastify";
import {CertificatesService} from "../../services/certificates";
import {AuthService} from "../../services/auth";
import {UserRole} from "../../../models/user";

@Service()
export class CertificatesController implements IController {
  constructor(private certificatesService: CertificatesService, private authService: AuthService) {
    this.getCertificate = this.getCertificate.bind(this);
    this.getCertificates = this.getCertificates.bind(this);
  }

  /**
   * Register the routes of the controller
   * @param instance Fastify instance
   * @param _opts Options of the instance
   * @param done Done callback, to pass control back to upper stack
   */
  register: FastifyPluginCallback<FastifyPluginOptions> = (instance, _opts, done) => {
    instance.get('/:id', this.getCertificate);
    instance.get('/', this.getCertificates);
    instance.addHook('preValidation', this.authService.authenticate)
    done();
    return null;
  }

  getCertificates: RouteHandler = async (request, reply) => {
    if (request.user?.category === UserRole.USER) {
      return reply.status(403).send({success: false, message: 'You do not have access to this ressource'});
    }
    return reply.send({certificates: await this.certificatesService.getCertificates()});
  }

  getCertificate: RouteHandler = async (request, reply) => {
    const {id} = request.params as { id: string };
    const certificate = await this.certificatesService.getCertificateById(id);
    if (request.user?.category === UserRole.USER && certificate.email !== request.user.email) {
      return reply.status(403).send({success: false, message: 'You do not have access to this ressource'});
    }
    return reply.send({certificate});
  }

}
