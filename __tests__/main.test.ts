import 'reflect-metadata';
import {Container} from "typedi";
import {MainService} from "../src/mainService";
import {HttpServer} from "../src/services/http-server";

describe('http-server', () => {
  // Act before assertions
  const mainService = Container.get(MainService);
  const httpServer = Container.get(HttpServer);

  beforeAll(async () => {
    await mainService.start();
  });


  // Assert if setTimeout was called properly
  it('should start an http server', () => {
    expect(httpServer.getInstance()).toBeDefined();
  });

  it('should answer on GET /status', async () => {
    const instance = httpServer.getInstance();
    const response = await instance.inject({path: '/status', method: 'GET'})
    expect(response.json()).toEqual({success: true});
  });

  afterAll(async () => {
    await httpServer.stop();
  })
});
