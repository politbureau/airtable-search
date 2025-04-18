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

// Format timestamp to: January 16 2025 @ 1:14PM
const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date
    .toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', '')
    .replace(' at', ' @');
};

export default function ResultsList({ results }: Props) {
  if (results.length === 0) {
    return <p className="text-black">No matching records found.</p>;
  }

  return (
    <ul className="space-y-4">
      {results.map((record) => (
        <li
          key={record.recordId}
          className="border border-black p-4 rounded-xl shadow bg-white"
        >
          <p
            className="text-lg font-bold mb-1"
            style={{
              color: '#f2a900',
              fontFamily: 'Roboto, sans-serif',
              fontStyle: 'normal',
            }}
          >
            {record.return_tracking || record.order_number || record.ra}
          </p>
          <p className="text-black font-sans">
            <strong>Member:</strong> {record.member_name} |
            <strong> Order #:</strong> {record.order_number}
            {record.return_tracking && (
              <> | <strong>Return Tracking:</strong> {record.return_tracking}</>
            )}
            {record.ra && <> | <strong>RA:</strong> {record.ra}</>}
          </p>
          <p className="text-black font-sans">
            {record.baseName && (
              <>
                <strong>Base Name:</strong> {record.baseName} |{' '}
              </>
            )}
            {record.createdTime && (
              <>
                <strong>Created:</strong> {formatTimestamp(record.createdTime)} |{' '}
              </>
            )}
            {record.lastModifiedTime && (
              <>
                <strong>Modified:</strong> {formatTimestamp(record.lastModifiedTime)}
              </>
            )}
          </p>
          {record.airtable_url ? (
            <a
              href={record.airtable_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline mt-2 inline-block font-sans"
            >
              View Record in Airtable
            </a>
          ) : (
            <p className="text-gray-400 mt-2 font-sans">No Airtable link available</p>
          )}
        </li>
      ))}
    </ul>
  );
}
