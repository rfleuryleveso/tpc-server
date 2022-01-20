import {Service} from "typedi";
import {HttpServer} from "../services/http-server";
import {AuthController} from "./controllers/auth";
import {UsersController} from "./controllers/users";


@Service()
export class RestApi {
  constructor(
    private httpServer: HttpServer,
    private authController: AuthController,
    private usersController: UsersController,
  ) {
  }

  registerHttp() {
    this.httpServer.register(this.authController.register, {prefix: '/auth'});
    this.httpServer.register(this.usersController.register, {prefix: '/users'});
  }


}
