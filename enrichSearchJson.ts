import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import axios from 'axios';

const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;
if (!AIRTABLE_TOKEN) {
  console.error('Missing Airtable PAT in .env.local');
  process.exit(1);
}

type RecordEntry = {
  baseId: string;
  tableName: string;
  recordId: string;
  fields: { [key: string]: any };
  airtableUrl: string;
  baseName?: string;
  createdTime?: string;
  lastModifiedTime?: string;
};

const inputPath = path.resolve(__dirname, 'public', 'search.json');
const outputPath = path.resolve(__dirname, 'public', 'enrichedSearch.ndjson');

async function getBaseName(baseId: string): Promise<string> {
  try {
    const res = await axios.get(`https://api.airtable.com/v0/meta/bases`, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });
    const base = res.data.bases.find((b: any) => b.id === baseId);
    return base?.name || 'Unknown Base';
  } catch (err: any) {
    console.error(`Error fetching base name for ${baseId}:`, err.message);
    return 'Unknown Base';
  }
}

async function getRecordMeta(baseId: string, tableName: string, recordId: string) {
  try {
    const res = await axios.get(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });
    return {
      createdTime: res.data.createdTime,
      lastModifiedTime: res.data.fields['Last Modified'] || null,
    };
  } catch (err: any) {
    console.error(`Error fetching record ${recordId} in base ${baseId}:`, err.message);
    return { createdTime: null, lastModifiedTime: null };
  }
}

(async () => {
  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const records: RecordEntry[] = JSON.parse(rawData);

  const baseNames: { [baseId: string]: string } = {};

  const outStream = fs.createWriteStream(outputPath, { flags: 'w' });

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const { baseId, tableName, recordId } = record;

    if (!baseNames[baseId]) {
      baseNames[baseId] = await getBaseName(baseId);
    }

    const { createdTime, lastModifiedTime } = await getRecordMeta(baseId, tableName, recordId);

    const enriched: RecordEntry = {
      ...record,
      baseName: baseNames[baseId],
      createdTime,
      lastModifiedTime
    };

    outStream.write(JSON.stringify(enriched) + '\n');

    if ((i + 1) % 100 === 0) {
      console.log(`✅ Processed ${i + 1} / ${records.length}`);
    }
  }

  outStream.end(() => {
    console.log(`🎉 Finished! NDJSON saved to: ${outputPath}`);
  });
})();
