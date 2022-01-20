import {IController} from "../index";
import {Service} from "typedi";
import {FastifyPluginCallback, FastifyPluginOptions, RouteHandler} from "fastify";
import {AuthService} from "../../services/auth";
import {UsersService} from "../../services/users";

@Service()
export class UsersController implements IController {
  constructor(private authService: AuthService, private usersService: UsersService) {
  }

  /**
   * Register the routes of the controller
   * @param instance Fastify instance
   * @param _opts Options of the instance
   * @param done Done callback, to pass control back to upper stack
   */
  register: FastifyPluginCallback<FastifyPluginOptions> = (instance, _opts, done) => {
    instance.get('/:id/qr', this.usersService.index)
    instance.get('/:id', this.getUser)

    instance.post('/:id/ce', this.addUserTest)
    instance.post('/:id/vaccines', this.usersService.index)
    instance.post('/:id/cas-contact', this.usersService.index)
    instance.delete('/:id/tests', this.usersService.index)

    instance.post('/', this.usersService.index);
    instance.get('/', this.usersService.index);
    instance.patch('/:id', this.usersService.index);
    instance.delete('/:id', this.usersService.index);

    instance.addHook('preValidation', this.authService.authenticate)

    done();
    return null;
  }

  getUser: RouteHandler = (request, reply) => {
    reply.send({
      user: request.user
    });
  }

  addUserTest: RouteHandler = (request, reply) => {
    reply.send({
      user: request.user
    });
  }
}


