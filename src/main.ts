import 'reflect-metadata';
import {Container} from "typedi";
import {MainService} from "./mainService";

const mainService = Container.get(MainService);
mainService.start();
