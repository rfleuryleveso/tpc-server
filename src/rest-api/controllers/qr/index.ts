import {IController} from "../index";
import {Service} from "typedi";
import {FastifyPluginCallback, FastifyPluginOptions, RouteHandler} from "fastify";
import {UsersService} from "../../services/users";

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
    const hasPass = await this.usersService.hasPass(user);
    reply.send({success: true, hasPass})
  }
}


