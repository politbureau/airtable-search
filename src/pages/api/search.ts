import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import Fuse from 'fuse.js';
import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

async function getReturns() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
  const [rows] = await connection.execute('SELECT * FROM Returns');
  await connection.end();
  return rows;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { q } = req.query;
    const allData: any[] = await getReturns();

    console.log("Total records in DB:", allData.length);

    if (!q || typeof q !== 'string' || q.trim() === '') {
      console.log("No query provided.");
      return res.status(200).json([]);
    }

    const query = q.trim().toLowerCase();
    console.log("Query:", query);

    const staticFields = ['return_tracking', 'order_number', 'bol_number', 'ra', 'item_number', 'rma_number'];
    const exactMatches = allData.filter(record => {
      return staticFields.some(key => {
        if (record[key]) {
          return record[key].toString().toLowerCase() === query;
        }
        return false;
      });
    });
    console.log("Exact Matches:", exactMatches.length);

    const fuse = new Fuse(allData, {
      keys: ['member_name'],
      threshold: 0.4,
    });
    const fuzzyMatches = fuse.search(query).map(result => result.item);
    console.log("Fuzzy Matches:", fuzzyMatches.length);

    const combinedMap = new Map();
    exactMatches.forEach(record => {
      combinedMap.set(record.recordId, record);
    });
    fuzzyMatches.forEach(record => {
      combinedMap.set(record.recordId, record);
    });

    const combinedResults = Array.from(combinedMap.values()).map(record => ({
      recordId: record.recordId,
      airtableUrl: record.airtable_url,
      member_name: record.member_name,
      order_number: record.order_number,
      return_tracking: record.return_tracking,
      ra: record.ra,
      bol_number: record.bol_number,
      item_number: record.item_number,
      rma_number: record.rma_number,
      baseName: record.baseName,
      createdTime: record.createdTime,
      lastModifiedTime: record.lastModifiedTime,
    }));

    res.status(200).json(combinedResults);
  } catch (err) {
    console.error("Error in search API:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
