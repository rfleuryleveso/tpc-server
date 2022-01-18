import {Schema} from 'mongoose';
import {Container} from "typedi";
import {Database} from "../services/database";

interface IVaccine {
  date: Date,
  lab: string
}

interface ITestResult {
  date: Date,
  result: boolean,
  variant: string,
}

interface IUser {
  token: string;
  name: string;
  surname: string;
  birthday: Date;
  mail: string;
  password: string;
  category: number;
  vaccines: Array<IVaccine>,
  tests_results: Array<ITestResult>
}

export const User: Schema = new Schema<IUser>({
  token: String,
  name: String,
  surname: String,
  birthday: Date, // Automatic cast to date
  mail: String,
  password: String,
  category: Number,
  vaccines: [{date: Date, lab: String}],
  tests_results: [{date: Date, result: Boolean, variant: String}]
}, {
  collection: 'users'
});

const database = Container.get(Database);
export default database.connection.model('User', User);
