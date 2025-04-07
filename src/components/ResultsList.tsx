import React from 'react';

type Result = {
  recordId: string;
  return_tracking?: string;
  order_number?: string;
  bol_number?: string;
  ra?: string;
  member_name?: string;
  item_number?: string;
  rma_number?: string;
  baseName?: string;
  createdTime?: string;
  lastModifiedTime?: string;
  airtable_url?: string;
};

type Props = {
  results: Result[];
};

export default function ResultsList({ results }: Props) {
  if (results.length === 0) {
    return <p>No matching records found.</p>;
  }

  return (
    <ul className="space-y-4">
      {results.map((record) => (
        <li key={record.recordId} className="border border-black p-4 rounded-xl shadow">
          <p
            style={{ color: '#f2a900', fontFamily: 'canada-type-gibson', fontStyle: 'normal' }}
            className="font-bold text-lg"
          >
            {record.return_tracking || record.order_number || record.ra}
          </p>
          <p>
            <strong>Member:</strong> {record.member_name} | <strong>Order #:</strong> {record.order_number}
            {record.return_tracking && <> | <strong>Return Tracking:</strong> {record.return_tracking}</>}
            {record.ra && <> | <strong>RA:</strong> {record.ra}</>}
          </p>
          <p>
            {record.baseName && <><strong>Base Name:</strong> {record.baseName} | </>}
            {record.createdTime && <><strong>Created:</strong> {record.createdTime} | </>}
            {record.lastModifiedTime && <><strong>Modified:</strong> {record.lastModifiedTime}</>}
          </p>
          {record.airtable_url ? (
            <a
              href={record.airtable_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              View Record in Airtable
            </a>
          ) : (
            <p className="text-gray-400 mt-2">No Airtable link available</p>
          )}
        </li>
      ))}
    </ul>
  );
}
