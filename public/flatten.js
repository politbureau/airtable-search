const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Path to your source JSON
const sourcePath = path.resolve(__dirname, 'search.json');
// Path to your new flattened CSV
const outputPath = path.resolve(__dirname, 'flattened.csv');

// Read the JSON file
const rawData = fs.readFileSync(sourcePath, 'utf-8');
const records = JSON.parse(rawData);

// Grab the sub-fields from the first record
const firstFields = records[0].fields || {};
const fieldKeys = Object.keys(firstFields);

// Build CSV headers: baseId, tableName, recordId, airtableUrl, and the sub-fields
const headers = [
  { id: 'baseId', title: 'baseId' },
  { id: 'tableName', title: 'tableName' },
  { id: 'recordId', title: 'recordId' },
  { id: 'airtable_url', title: 'airtable_url' }, // ✅ Added Airtable URL column
  ...fieldKeys.map(key => ({
    id: key,
    title: key.replace(/[#]/g, '') // Remove # from column names if present
  })),
];

// Create the CSV writer
const csvWriter = createCsvWriter({
  path: outputPath,
  header: headers,
});

// Flatten each record
const flattened = records.map(rec => {
  const flat = {
    baseId: rec.baseId || '',
    tableName: rec.tableName || '',
    recordId: rec.recordId || '',
    airtable_url: rec.airtableUrl || '', // ✅ Add the URL if it exists
  };

  const subFields = rec.fields || {};
  fieldKeys.forEach(k => {
    flat[k] = subFields[k] || '';
  });

  return flat;
});

// Write CSV
csvWriter.writeRecords(flattened)
  .then(() => {
    console.log('✅ Flattened CSV created at:', outputPath);
  })
  .catch(err => console.error('❌ Error writing CSV:', err));
