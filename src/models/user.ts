import {Model, Schema} from 'mongoose';
import {Container} from "typedi";
import {Database} from "../services/database";

export enum UserRole {
  USER,
  HEALTHCARE,
  ADMIN
}

export interface IUser {
  name: string;
  surname: string;
  birthdate: Date;
  email: string;
  password: string;
  category: UserRole;
}

export const UserSchema: Schema = new Schema<IUser>({
  name: String,
  surname: String,
  birthdate: Date, // Automatic cast to date
  email: String,
  password: String,
  category: Number,
}, {
  collection: 'users'
});

const database = Container.get(Database);
const UserModel = database.connection.model('User', UserSchema) as Model<IUser>;

export default UserModel;
