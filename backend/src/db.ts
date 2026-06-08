import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Supabase fornece DATABASE_URL; fallback para variáveis individuais em dev
export const db = new Pool(
    process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: false },
          }
        : {
              host:     process.env.DB_HOST,
              port:     Number(process.env.DB_PORT),
              user:     process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
          }
);