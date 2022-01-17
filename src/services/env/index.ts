import {Service} from 'typedi';
import * as dotenv from 'dotenv'
import {AppEnvironmentVariables, appEnvironmentVariablesSchema} from "./validation";
import Ajv from "ajv"
import {AppLogger} from "../logger";

@Service()
export class AppEnv {
  private values: AppEnvironmentVariables;

  constructor(private appLogger: AppLogger) {
    let {parsed} = dotenv.config();
    if (!parsed) {
      // If no parsed data, create an empty object that will be populated by ajv
      parsed = {};
    }

    // Validate the parsed environment against the env schema.
    // Use defaults mean that non-compliant values will be replaced with defaults
    const validator = new Ajv({useDefaults: true});
    const validate = validator.compile(appEnvironmentVariablesSchema);
    // If there are errors, halt the execution
    if (!validate(parsed)) {
      // Print every error, if there are.
      validate.errors?.forEach((error) => {
        this.appLogger.error(`Env validation error ${error.schemaPath} ${error.message}`);
      })
      throw new Error('Environment loading has failed due to a loading error');
    }
    this.values = parsed;
  }

  public get(key: keyof AppEnvironmentVariables): AppEnvironmentVariables[keyof AppEnvironmentVariables] {
    return this.values[key];
  }
}
