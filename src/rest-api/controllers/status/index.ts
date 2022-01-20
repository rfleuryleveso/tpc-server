import {IController} from "../index";
import {Service} from "typedi";
import {FastifyPluginCallback, FastifyPluginOptions} from "fastify";
import {StatusService} from "../../services/status";

@Service()
export class StatusController implements IController {
  constructor(private statusService: StatusService) {
  }

  /**
   * Register the routes of the controller
   * @param instance Fastify instance
   * @param _opts Options of the instance
   * @param done Done callback, to pass control back to upper stack
   */
  register: FastifyPluginCallback<FastifyPluginOptions> = (instance, _opts, done) => {
    instance.get('/', this.statusService.index)
    done();
    return null;
  }
}


