import {Service} from "typedi";
import {HttpServer} from "../services/http-server";
import {AuthController} from "./controllers/auth";
import {UsersController} from "./controllers/users";
import {QrController} from "./controllers/qr";
import {CertificatesController} from "./controllers/certificates";


@Service()
export class RestApi {
  constructor(
    private httpServer: HttpServer,
    private authController: AuthController,
    private usersController: UsersController,
    private qrController: QrController,
    private certificatesController: CertificatesController,
  ) {
  }

  registerHttp() {
    this.httpServer.register(this.authController.register, {prefix: '/auth'});
    this.httpServer.register(this.usersController.register, {prefix: '/users'});
    this.httpServer.register(this.qrController.register, {prefix: '/qr'});
    this.httpServer.register(this.certificatesController.register, {prefix: '/certificates'});
  }


}
