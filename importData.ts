import * as fs from 'fs';
import * as path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

// Get DB connection settings from .env.local or create a new .env file for DB settings
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

// Create a function to import data
async function importData() {
  // Connect to the MySQL database
  const connection = await mysql.createConnection({
    host: DB_HOST,         // e.g., searchdb.cvke8kswc02k.ca-central-1.rds.amazonaws.com
    port: Number(DB_PORT), // typically 3306
    user: DB_USER,         // your RDS master username
    password: DB_PASSWORD, // your RDS master password
    database: DB_NAME,     // e.g., searchdb
  });

  // Path to your search.json file (adjust if needed)
  const filePath = path.resolve(__dirname, 'public', 'search.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Loop through each record in the JSON file.
  // Adjust this code based on your JSON structure.
  // We assume each record is an object with:
  // - record.fields contains your fields from Airtable.
  // - airtableUrl is already provided.
  for (const record of data) {
    // Extract the fields. Change the property names if necessary.
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

    // Insert into the Returns table
    try {
      await connection.execute(
        `INSERT INTO Returns 
         (baseId, tableName, recordId, return_tracking, order_number, bol_number, ra, member_name, item_number, rma_number, airtable_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [baseId, tableName, recordId, returnTracking, orderNumber, bolNumber, ra, memberName, itemNumber, rmaNumber, airtableUrl]
      );
    } catch (error) {
      console.error("Insert error:", error);
    }
  }

  console.log('Data import complete.');
  await connection.end();
}

importData().catch(err => {
  console.error("Error during import:", err);
});
