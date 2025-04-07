import { config } from 'dotenv';

const env = process.env.NODE_ENV;

config({ path: env ? `./env/.env.${process.env.NODE_ENV}` : '.env' });
