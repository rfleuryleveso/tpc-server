import {Schema} from 'mongoose';
import {Container} from "typedi";
import {Database} from "../services/database";


interface IMedic {
  medicalId: number,
  name: string,
  surname: string
}

export const Medics: Schema = new Schema<IMedic>({
  medicalId: Number,
  name: String,
  surname: String
}, {
  collection: 'medics'
})

const database = Container.get(Database);
export default database.connection.model('Medics', Medics);
