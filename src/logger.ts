export const logger = import.meta.env.DEV
  ? {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    }
  : {
      level: 'warn',
    };
