import {Schema, model} from 'mongoose';

export const User: Schema = new Schema({
  id: Object,
  token: String,
  name: String,
  surname: String,
  birthday: Date, // parse en date
  mail: String,
  psw: String,
  category: Number,
  vaccine: [{date: Date, lab: String}],
  tests_results: [{date: Date, result: Boolean, variant: String}]
}, {
  collection: 'users'
})

export default model('User', User);
