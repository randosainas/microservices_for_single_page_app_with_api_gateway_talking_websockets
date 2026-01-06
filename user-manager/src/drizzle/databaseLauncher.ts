// TODO put in separate file, maybe index.ts in drizzle?
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import 'dotenv/config';
import * as schema from './schema';

const sqlite = new Database("db/sqlite.db");
const db = drizzle(sqlite, { schema });

export default db;
