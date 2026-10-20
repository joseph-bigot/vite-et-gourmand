import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5433),
  username: process.env.POSTGRES_USER || 'vite_admin',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'vite_gourmand',
}));
