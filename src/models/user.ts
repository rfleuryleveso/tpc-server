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
  avatar: string;
}

export const UserSchema: Schema = new Schema<IUser>({
  name: Schema.Types.String,
  surname: Schema.Types.String,
  birthdate: Schema.Types.Date, // Automatic cast to date
  email: Schema.Types.String,
  password: Schema.Types.String,
  category: Schema.Types.Number,
  avatar: Schema.Types.String
}, {
  collection: 'users'
});

const database = Container.get(Database);
const UserModel = database.connection.model('User', UserSchema) as Model<IUser>;

export default UserModel;
