import { useState, useEffect } from 'react';
import ResultsList from '@/components/ResultsList';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsLoading(false);
      setElapsed(0);
      return;
    }

    const startTime = performance.now();
    setIsLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        // Sort results by lastModifiedTime descending
        const sorted = data.sort((a: any, b: any) => {
          const dateA = new Date(a.lastModifiedTime || a.createdTime || 0).getTime();
          const dateB = new Date(b.lastModifiedTime || b.createdTime || 0).getTime();
          return dateB - dateA;
        });

        setResults(sorted);
        setIsLoading(false);
        setElapsed((performance.now() - startTime) / 1000); // seconds
      })
      .catch((err) => {
        console.error('Search error:', err);
        setIsLoading(false);
      });
  }, [query]);

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">Returns Search</h1>
      <input
        type="text"
        placeholder="Search Returns..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring focus:border-blue-400"
      />

      <div className="mt-6">
        {isLoading ? (
          <p className="text-gray-500 italic">🔍 Searching for records...</p>
        ) : query && results.length === 0 ? (
          <p className="text-red-500 italic">❌ No results found.</p>
        ) : (
          <>
            <ResultsList results={results} />
            <p className="mt-4 text-sm text-gray-500">
              ✅ {results.length} record{results.length !== 1 && 's'} found in {elapsed.toFixed(2)} seconds
            </p>
          </>
        )}
      </div>
    </main>
  );
}
