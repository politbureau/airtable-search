import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import * as path from 'path';
import Fuse from 'fuse.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(200).json([]);
    }

    const query = q.trim().toLowerCase();
    const pool = getPool();

    const [rows] = await pool.execute('SELECT * FROM Returns');
    const allData = rows as any[];

    const staticFields = [
      'return_tracking',
      'order_number',
      'bol_number',
      'ra',
      'item_number',
      'rma_number',
    ];

    const exactMatches = allData.filter(record =>
      staticFields.some(key =>
        record[key]?.toString().toLowerCase() === query
      )
    );

    const fuse = new Fuse(allData, {
      keys: ['member_name'],
      threshold: 0.4,
    });

    const fuzzyMatches = fuse.search(query).map(r => r.item);

    const combinedMap = new Map();
    exactMatches.forEach(r => combinedMap.set(r.recordId, r));
    fuzzyMatches.forEach(r => combinedMap.set(r.recordId, r));

    const combinedResults = Array.from(combinedMap.values());

    // Sort by created_time DESC (most recent first)
    combinedResults.sort((a, b) => {
      const dateA = new Date(a.created_time).getTime();
      const dateB = new Date(b.created_time).getTime();
      return dateB - dateA;
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🔍 Found ${combinedResults.length} results in ${elapsed}s`);

    res.status(200).json(combinedResults);
  } catch (err: any) {
    console.error('❌ Search API Error:', err.message || err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
