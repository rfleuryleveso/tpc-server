import {Schema, model} from 'mongoose';

export const Medics: Schema = new Schema({
  id: Object,
  medicalId: Number,
  name: String,
  surname: String
}, {
  collection: 'medics'
})

export default model('Medics', Medics);
