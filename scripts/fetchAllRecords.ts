import * as fs from 'fs/promises';
import * as path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env.local in the project root
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Debug: log out DB connection info
console.log('Loaded environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

console.log('1. Starting data import...');

async function loadData() {
  const filePath = path.resolve(__dirname, 'public', 'search.json');
  console.log('2. Reading JSON file from:', filePath);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    console.log(`3. Loaded ${data.length} records from JSON`);
    return data;
  } catch (err) {
    console.error('Error reading or parsing JSON file:', err);
    process.exit(1);
  }
}

async function importData() {
  // Load the data asynchronously
  const data = await loadData();

  console.log('4. Connecting to DB...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log('5. Connected to DB successfully.');
  } catch (err) {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  }

  console.log('6. Starting insert loop...');
  let count = 0;
  for (const record of data) {
    try {
      const fields = record.fields;
      const returnTracking = fields["Return Tracking"] || null;
      const orderNumber = fields["Order #"] || null;
      const bolNumber = fields["BOL #"] || null;
      const ra = fields["RA"] || null;
      const memberName = fields["Member Name"] || null;
      const itemNumber = fields["Item #"] || null;
      const rmaNumber = fields["RMA #"] || null;
      const airtableUrl = record.airtableUrl || null;
      const baseId = record.baseId || null;
      const tableName = record.tableName || null;
      const recordId = record.recordId || null;

      await connection.execute(
        `INSERT INTO Returns 
         (baseId, tableName, recordId, return_tracking, order_number, bol_number, ra, member_name, item_number, rma_number, airtable_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [baseId, tableName, recordId, returnTracking, orderNumber, bolNumber, ra, memberName, itemNumber, rmaNumber, airtableUrl]
      );
      count++;
      if (count % 1000 === 0) {
        console.log(`Inserted ${count} records so far...`);
      }
    } catch (err) {
      console.error('Insert error:', err);
    }
  }
  console.log(`7. Data import complete. Total records inserted: ${count}`);
  await connection.end();
}

importData().catch(err => {
  console.error("Error during import:", err);
});
