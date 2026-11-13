import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const url = new URL(databaseUrl);

    return {
      host: url.hostname,
      port: Number(url.port || 5432),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.slice(1)),
      ssl: process.env.DATABASE_SSL === 'false'
        ? false
        : { rejectUnauthorized: false },
    };
  }

  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5433),
    username: process.env.POSTGRES_USER || 'vite_admin',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB || 'vite_gourmand',
    ssl: false,
  };
});
