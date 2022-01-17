import {Service} from 'typedi';
import dotenv from 'dotenv'
import {AppEnvironmentVariables} from "./validation";

@Service()
export class AppEnv {
  private values: AppEnvironmentVariables;

  constructor() {
    const {parsed} = dotenv.config();
    if (!parsed) {
      throw new Error('No environnment variables available');
    }
    // TODO: Add validation to the environnment variables
    // @ts-expect-error This will lead to an error because there is no validation applied.
    this.values = parsed;
  }

  public get(key: keyof AppEnvironmentVariables): AppEnvironmentVariables[keyof AppEnvironmentVariables] {
    return this.values[key];
  }
}
