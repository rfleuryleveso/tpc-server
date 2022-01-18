import {Service} from "typedi";
import {AppEnv} from "../env";
import * as mongoose from "mongoose";

@Service()
export class Database {
  connection: mongoose.Connection;

  constructor(appEnv: AppEnv) {
    this.connection = mongoose.createConnection(appEnv.get('MONGODB_SRV') as string)
  }

  /**
   * Closes the connection to the mongodb instance
   */
  closeConnection() {
    this.connection?.close()
  }
}
