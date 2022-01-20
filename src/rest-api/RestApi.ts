import {Service} from "typedi";
import {HttpServer} from "../services/http-server";
import {StatusController} from "./controllers/status";


@Service()
export class RestApi {
  constructor(private httpServer: HttpServer, private statusController: StatusController) {
  }

  registerHttp() {
    this.httpServer.register(this.statusController.register, {prefix: '/status'})
  }


}
