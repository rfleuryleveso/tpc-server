import {IController} from "../index";
import {Service} from "typedi";
import {FastifyPluginCallback, FastifyPluginOptions, RouteHandler} from "fastify";
import {AuthService} from "../../services/auth";
import Ajv from "ajv";
import {registerSchema} from "./bodies/register";
import {loginSchema} from "./bodies/login";
import ajvFormats from 'ajv-formats'
import {MedicId} from "../../../services/medicId";
import {UserRole} from "../../../models/user";
import {NoReplyMailer} from "../../../services/mailer";
import {UsersService} from "../../services/users";

@Service()
export class AuthController implements IController {
  constructor(private authService: AuthService, private medicId: MedicId, private noReplyMailer: NoReplyMailer, private usersService: UsersService) {
  }

  /**
   * Register the routes of the controller
   * @param instance Fastify instance
   * @param _opts Options of the instance
   * @param done Done callback, to pass control back to upper stack
   */
  register: FastifyPluginCallback<FastifyPluginOptions> = (instance, _opts, done) => {
    instance.post('/login', this.login)
    instance.post('/register', this.registerUser)
    instance.put('/password', this.login)
    done();
    return null;
  }

  login: RouteHandler = (request, reply) => {
    const {body} = request;
    const validator = new Ajv();
    ajvFormats(validator);
    const validate = validator.compile(loginSchema);
    // If there are errors, halt the execution
    if (!validate(body)) {
      // Print every error, if there are.
      reply.code(406).send({
        success: false,
        error: validate.errors?.map(error => error.message).join(', ')
      });
      return;
    }
    this.authService.login(body).then(result => {
      reply.send(result);
    }).catch(error => {
      reply.status(403).send({success: false, message: error.message})
    })
  }

  registerUser: RouteHandler = (request, reply) => {
    const {body} = request;
    const validator = new Ajv({useDefaults: true});
    ajvFormats(validator);
    const validate = validator.compile(registerSchema);
    // If there are errors, halt the execution
    if (!validate(body)) {
      // Print every error, if there are.
      reply.code(410).send({
        success: false,
        error: validate.errors?.map(error => error.message).join(', ')
      });
      return;
    }
    if (body.category === UserRole.HEALTHCARE) {
      if (!this.medicId.checkMedic(body.name, body.surname, body.medId)) {
        reply.code(403).send({
          success: false,
          error: 'Could not identify you as a medic'
        });
        return;
      }
    }
    this.authService.register(body)
      .then(result => this.noReplyMailer.createAccountMessage({
        recipient: body.email,
        surname: body.surname,
        name: body.name
      })
        .then(() => result))
      .then(result => {

        reply.send(result);
      }).catch(error => {
      reply.status(403).send({success: false, message: error.message})
    });
    return;
  }
}


