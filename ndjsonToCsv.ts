import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

const ndjsonPath = path.resolve(__dirname, 'public', 'enrichedSearch.ndjson');
const csvPath = path.resolve(__dirname, 'public', 'enrichedSearch.csv');

// Read all lines from NDJSON and parse into objects
const lines = fs.readFileSync(ndjsonPath, 'utf-8').split('\n').filter(Boolean);
const records = lines.map(line => JSON.parse(line));

// Extract all unique field keys from the first record's `fields` object
const firstFields = records[0]?.fields || {};
const fieldKeys = Object.keys(firstFields);

// CSV headers: include top-level and field-level keys
const headers = [
  { id: 'baseId', title: 'baseId' },
  { id: 'baseName', title: 'baseName' },
  { id: 'tableName', title: 'tableName' },
  { id: 'recordId', title: 'recordId' },
  ...fieldKeys.map(key => ({
    id: key,
    title: key.replace(/[#]/g, '') // Remove # for clean column names
  })),
  { id: 'airtableUrl', title: 'airtableUrl' },
  { id: 'createdTime', title: 'createdTime' },
  { id: 'lastModifiedTime', title: 'lastModifiedTime' }
];

// Flatten the records
const flattened = records.map(rec => {
  const flat: any = {
    baseId: rec.baseId,
    baseName: rec.baseName || '',
    tableName: rec.tableName,
    recordId: rec.recordId,
    airtableUrl: rec.airtableUrl,
    createdTime: rec.createdTime || '',
    lastModifiedTime: rec.lastModifiedTime || ''
  };

  // Flatten fields object
  for (const key of fieldKeys) {
    flat[key] = rec.fields?.[key] ?? '';
  }

  return flat;
});

// Write to CSV
const csvWriter = createObjectCsvWriter({
  path: csvPath,
  header: headers
});

csvWriter
  .writeRecords(flattened)
  .then(() => {
    console.log(`✅ CSV created at: ${csvPath}`);
  })
  .catch(err => {
    console.error('❌ Error writing CSV:', err);
  });
