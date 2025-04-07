import React from 'react';

type SearchResult = {
  recordId: string;
  airtableUrl: string;
  member_name: string;
  order_number: string;
  return_tracking: string;
  ra: string;
  bol_number: string;
  item_number: string;
  rma_number: string;
  baseName?: string;
  createdTime?: string;
  lastModifiedTime?: string;
};

type Props = {
  results: SearchResult[];
};

const ResultsList: React.FC<Props> = ({ results }) => {
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div key={result.recordId} className="border p-4 rounded-xl shadow-md bg-white">
          <div className="mb-2 text-sm text-gray-700">
            <strong>Member:</strong> {result.member_name} | <strong>Order #:</strong> {result.order_number} | <strong>Return Tracking:</strong> {result.return_tracking} | <strong>RA:</strong> {result.ra}
          </div>
          <div className="text-sm text-gray-600">
            <strong>Base Name:</strong> {result.baseName || 'Unknown'} | <strong>Created:</strong> {result.createdTime || 'N/A'} | <strong>Modified:</strong> {result.lastModifiedTime || 'N/A'}
          </div>
          <a
            href={result.airtableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 mt-2 inline-block"
          >
            View Record in Airtable
          </a>
        </div>
      ))}
    </div>
  );
};

export default ResultsList;
