import React, { useEffect, useState } from 'react';
import { fetchAcceptedDemands } from '../../hooks/api/demandApi';

const AcceptedDemands = () => {
  const [acceptedDemands, setAcceptedDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccepted = async () => {
      try {
        const data = await fetchAcceptedDemands();
        setAcceptedDemands(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAccepted();
  }, []);

  if (loading) return <div>Loading accepted demands…</div>;
  if (error)   return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Accepted Demands</h2>
      {acceptedDemands.length === 0 ? (
        <p>No accepted demands found.</p>
      ) : (
        <ul>
          {acceptedDemands.map((d) => (
            <li key={d.demandId} className="mb-4">
              <p><strong>ID:</strong> {d.demandId}</p>
              <p><strong>Title:</strong> {d.title}</p>
              <p><strong>Description:</strong> {d.demand}</p>
              <p><strong>Category:</strong> {d.category}</p>
              <p><strong>Created:</strong> {new Date(d.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AcceptedDemands;
