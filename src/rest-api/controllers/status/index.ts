import {FastifyPluginCallback, FastifyPluginOptions} from "fastify";


/**
 * Status controller sends informations regarding the application.
 * @param instance
 * @param _opts
 * @param next
 */
const statusController: FastifyPluginCallback<FastifyPluginOptions> = (instance, _opts, next) => {
  // Handle GET /status/
  instance.get('/', (req, res) => {
    res.send(`Hello ${req.ip}`);
  })
  next();
  return null;
}

export default statusController;
