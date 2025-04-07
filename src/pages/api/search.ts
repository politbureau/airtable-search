import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import Fuse from 'fuse.js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(200).json([]);
    }

    const query = q.trim().toLowerCase();

    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Exact match query for static fields
    const [exactRows] = await connection.execute(
      `
      SELECT * FROM Returns
      WHERE LOWER(return_tracking) = ?
         OR LOWER(order_number) = ?
         OR LOWER(ra) = ?
         OR LOWER(item_number) = ?
         OR LOWER(rma_number) = ?
      LIMIT 50
      `,
      [query, query, query, query, query]
    );

    // Fuzzy match on member_name
    const [allRows] = await connection.execute(
      'SELECT * FROM Returns WHERE member_name IS NOT NULL LIMIT 500'
    );

    await connection.end();

    const fuse = new Fuse(allRows as any[], {
      keys: ['member_name'],
      threshold: 0.4,
    });

    const fuzzyMatches = fuse.search(query).map(result => result.item);

    // Combine exact and fuzzy matches, deduplicated by recordId
    const combinedMap = new Map();
    (exactRows as any[]).forEach(record => {
      combinedMap.set(record.recordId, record);
    });
    fuzzyMatches.forEach(record => {
      combinedMap.set(record.recordId, record);
    });

    const combinedResults = Array.from(combinedMap.values());

    res.status(200).json(combinedResults);
  } catch (err) {
    console.error('Error in search API:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
