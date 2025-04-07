import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Helper to create connection
async function getConnection() {
  return mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(400).json({ error: 'Missing search query' });
    }

    const query = q.trim();

    const connection = await getConnection();

    // Query the three indexed fields
    const [results] = await connection.execute(
      `
      SELECT * FROM Returns
      WHERE return_tracking = ? OR order_number = ? OR ra = ?
      `,
      [query, query, query]
    );

    await connection.end();

    return res.status(200).json(results);
  } catch (err: any) {
    console.error('Search API error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
