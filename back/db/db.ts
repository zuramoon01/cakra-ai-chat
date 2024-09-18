import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const { PGUSER, PGPASSWORD, PGHOST, PGDATABASE } = Bun.env as {
  PGUSER: string;
  PGPASSWORD: string;
  PGHOST: string;
  PGDATABASE: string;
};

const postgresClient = postgres({
  username: PGUSER,
  password: PGPASSWORD,
  host: PGHOST,
  database: PGDATABASE,
  ssl: 'require',
});

export const db = drizzle(postgresClient, { schema });
