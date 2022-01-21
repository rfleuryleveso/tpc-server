import {IController} from "../index";
import {Service} from "typedi";
import {FastifyPluginCallback, FastifyPluginOptions, RouteHandler} from "fastify";
import {AuthService} from "../../services/auth";
import {UsersService} from "../../services/users";
import {IUser, UserRole} from "../../../models/user";
import {HydratedDocument} from "mongoose";
import {CertificateType, ICertificate} from "../../../models/certificate";
import Ajv from "ajv";
import {addCertificateRequest} from "./bodies/addCertificate";
import {CertificatesService} from "../../services/certificates";
import {updateUserSchema} from "./bodies/updateUser";
import {addContactCase} from "./bodies/contactCase";
import ajvFormats from 'ajv-formats'

@Service()
export class UsersController implements IController {
  constructor(private authService: AuthService, private usersService: UsersService, private certificatesService: CertificatesService) {
    this.addUserCertificate = this.addUserCertificate.bind(this);
    this.genCertificatePdf = this.genCertificatePdf.bind(this);
  }

  /**
   * Register the routes of the controller
   * @param instance Fastify instance
   * @param _opts Options of the instance
   * @param done Done callback, to pass control back to upper stack
   */
  register: FastifyPluginCallback<FastifyPluginOptions> = (instance, _opts, done) => {
    instance.get('/', this.getUsers);
    instance.get('/:id', this.getUser)
    instance.get('/:id/pdf', this.genCertificatePdf)

    instance.get('/:id/certificates', this.getUserCertificates)
    instance.post('/:id/certificates', this.addUserCertificate)
    instance.post('/:id/contact', this.sendContactCase)

    instance.patch('/:id/avatar', this.updateUserAvatar)


    instance.patch('/:id', this.updateUser);
    instance.delete('/:id', this.deleteUser);

    instance.addHook('preValidation', this.authService.authenticate)

    done();
    return null;
  }

  getUser: RouteHandler = (request, reply) => {
    reply.send({
      user: request.user
    });
  }


  addUserCertificate: RouteHandler = async (request, reply) => {
    if ((request.user?.category ?? UserRole.USER) === UserRole.USER) {
      reply.status(403).send({success: false, message: 'You are not allowed to add certificates'});
      return;
    }
    const {body} = request;
    const validator = new Ajv();
    const validate = validator.compile(addCertificateRequest);
    // If there are errors, halt the execution
    if (!validate(body)) {
      // Print every error, if there are.
      reply.code(406).send({
        success: false,
        error: validate.errors?.map(error => error.message).join(', ')
      });
      return;
    }
    const certificate = await this.certificatesService.createUserCertificate({...body, date: new Date()});

    return reply.send({
      certificate
    });
  }

  getUserCertificates: RouteHandler = async (request, reply) => {
    let target: string | undefined = undefined;
    if ((request.user?.category ?? UserRole.USER) === UserRole.USER) {
      target = request.user?._id?.toHexString();
    } else {
      target = (request.params as { id: string }).id;
    }
    if (!target) {
      return reply.status(404).send({
        success: false,
        error: 'No target found'
      })
    }

    let certificates: Array<HydratedDocument<ICertificate>> = [];
    if (target === "self") {
      certificates = await this.usersService.getUserCertificates(request.user!)
    } else {
      certificates = await this.usersService.getUserCertificates(target);
    }
    return reply.send({
      certificates
    });
  }

  updateUserAvatar: RouteHandler = async (request, reply) => {
    let target: string | undefined = undefined;
    if ((request.user?.category ?? UserRole.USER) === UserRole.USER) {
      target = request.user?._id?.toHexString();
    } else {
      target = (request.params as { id: string }).id;
    }
    if (!target) {
      return reply.status(404).send({
        success: false,
        error: 'No target found'
      })
    }

    let user: HydratedDocument<IUser>;
    if (request.body && typeof request.body === "string" && (request.body as string).length > 0) {
      user = await this.usersService.updateUserImage(target, Buffer.from(request.body as string, 'base64'))
    } else {
      user = await this.usersService.updateUserImage(target);
    }
    return reply.send({
      user
    });
  }

  updateUser: RouteHandler = async (request, reply) => {
    let target: string | undefined = undefined;
    if ((request.user?.category ?? UserRole.USER) === UserRole.USER) {
      target = request.user?._id?.toHexString();
    } else {
      target = (request.params as { id: string }).id;
    }
    if (!target) {
      return reply.status(404).send({
        success: false,
        error: 'No target found'
      })
    }

    const {body} = request;
    const validator = new Ajv();
    const validate = validator.compile(updateUserSchema);
    // If there are errors, halt the execution
    if (!validate(body)) {
      // Print every error, if there are.
      return reply.code(406).send({
        success: false,
        error: validate.errors?.map(error => error.message).join(', ')
      });
    }
    const user: HydratedDocument<IUser> = await this.usersService.updateUser(target, body);
    return reply.send({
      user
    });
  }

  deleteUser: RouteHandler = async (request, reply) => {
    let target: string | undefined = undefined;
    if ((request.user?.category ?? UserRole.USER) === UserRole.USER) {
      target = request.user?._id?.toHexString();
    } else {
      target = (request.params as { id: string }).id;
    }
    if (!target) {
      return reply.status(404).send({
        success: false,
        error: 'No target found'
      })
    }
    if ((request.user?.category ?? UserRole.USER) === UserRole.USER) {
      return reply.status(403).send({success: false, message: 'You are not allowed to delete an user'});
    }

    const {body} = request;
    const validator = new Ajv();
    const validate = validator.compile(updateUserSchema);
    // If there are errors, halt the execution
    if (!validate(body)) {
      // Print every error, if there are.
      return reply.code(406).send({
        success: false,
        error: validate.errors?.map(error => error.message).join(', ')
      });
    }
    const user: HydratedDocument<IUser> = await this.usersService.deleteUser(target);
    return reply.send({
      _id: user._id
    });
  }
  getUsers: RouteHandler = async (request, reply) => {
    if ((request.user?.category ?? UserRole.USER) === UserRole.USER) {
      reply.status(403).send({success: false, message: 'You are not allowed to list all users'});
      return;
    }
    reply.send({
      users: await this.usersService.getUsers()
    });
  }

  sendContactCase: RouteHandler = async (request, reply) => {
    let target: string | undefined = undefined;
    if ((request.user?.category ?? UserRole.USER) === UserRole.USER) {
      target = request.user?._id?.toHexString();
    } else {
      target = (request.params as { id: string }).id;
    }
    if (!target) {
      return reply.status(404).send({
        success: false,
        error: 'No target found'
      })
    }

    const targetUser = await this.usersService.getUserById(target);

    const {body} = request;
    const validator = new Ajv();
    ajvFormats(validator);
    const validate = validator.compile(addContactCase);

    // If there are errors, halt the execution
    if (!validate(body)) {
      // Print every error, if there are.
      return reply.code(406).send({
        success: false,
        error: validate.errors?.map(error => error.message).join(', ')
      });
    }

    const certificates = await this.usersService.getUserCertificates(target);
    const testCertificates = certificates
      .filter(certificate => certificate.type === CertificateType.TEST)
      .sort((certificateA, certificateB) => certificateB.date.getTime() - certificateA.date.getTime());
    if (testCertificates.length === 0 || (testCertificates[0].metadata?.RESULT ?? 'negative') === 'negative') {
      return reply.status(406).send({
        success: false,
        error: 'Their is no positive test for this user'
      })
    }
    await this.usersService.sendContactCaseEmails(targetUser, body.emails, testCertificates[0]);
    const user: HydratedDocument<IUser> = request.user!;
    return reply.send({
      user
    });
  }

  genCertificatePdf: RouteHandler = async (request, reply) => {
    let target: string | undefined = undefined;
    if ((request.user?.category ?? UserRole.USER) === UserRole.USER) {
      target = request.user?._id?.toHexString();
    } else {
      target = (request.params as { id: string }).id;
    }
    if (!target) {
      return reply.status(404).send({
        success: false,
        error: 'No target found'
      })
    }
    return reply.type('application/pdf').send(await this.usersService.genCertificatePdf(target));
  }
}


