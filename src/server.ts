import { app } from './app';
import { logger } from './logger';

const server = app({
  logger,
  pluginTimeout: 50000,
  bodyLimit: 15485760,
});

if (import.meta.env.PROD) {
  const PORT = 3000;
  try {
    server.listen({ port: PORT as number, host: '0.0.0.0' });
    server.log.info(`Server started on 0.0.0.0:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

export const viteNodeApp = server;
