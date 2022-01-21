import {Service} from 'typedi';
import * as fs from "fs";
import {AppLogger} from "../logger";

type MedicIdFile = Array<{ medicId: string, name: string, surname: string }>

@Service()
export class MedicId {
  file: MedicIdFile = [];

  constructor(private appLogger: AppLogger) {
    this.loadData();
  }

  loadData() {
    fs.readFile('./storage/medics.json', {encoding: 'utf-8'}, (error, data) => {
      if (error) {
        this.appLogger.error('Could not load medics file', {error});
        return;
      }
      this.file = JSON.parse(data);
      this.appLogger.info(`Loaded ${this.file.length} from medics file`);
    })
  }

  checkMedic(name: string, surname: string, medicId: string): boolean {
    const [medic] = this.file.filter(file => file.medicId === medicId);
    if (!medic) {
      return false;
    }
    return medic.name === name && medic.surname === surname;
  }

}
