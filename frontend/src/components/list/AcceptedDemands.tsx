import React, { useState, useEffect } from 'react';
import { fetchMyDemands, fetchDemandsByIds } from '../../hooks/api/demandApi';
import Button from '../button/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateMatchStatus } from "../../hooks/api/demandApi";



interface Match {
  id?: string;
  demandId: string;
  status: string;
  author?: string;
  title?: string;
  demand?: string;
  organisation?: string;
}

interface Demand {
  demandId: string;
  title: string;
  demand: string;
  category: string;
  createdAt: string;
  matches: (Match | string)[];
  author: string;
}

const AcceptedDemands: React.FC = () => {
  const [items, setItems] = useState<{ demand: Demand; matches: Match[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<Match[]>([]);
  const [viewingDemand, setViewingDemand] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchMyDemands();
        const myDemands: Demand[] = resp.data || [];

        const out: { demand: Demand; matches: Match[] }[] = [];

        for (const d of myDemands) {
          if (!Array.isArray(d.matches) || d.matches.length === 0) continue;

          const matchedIds: string[] = [];
          const statusMap: Record<string, string> = {};

          for (const m of d.matches) {
            const id = typeof m === 'object' ? m.id : m;
            const status = typeof m === 'object' ? m.status : 'new';
            if (id && status === 'matched') {
              matchedIds.push(id);
              statusMap[id] = status;
            }
          }

          if (matchedIds.length === 0) continue;

          const matchesResp = await fetchDemandsByIds(matchedIds);
          const fetched = Array.isArray(matchesResp.data)
            ? matchesResp.data
            : [matchesResp.data];

          const matchesWithStatus = fetched.map((md: any) => ({
            ...md,
            status: statusMap[md.demandId] || 'matched',
            demand: md.demand,
            organisation: md.organisation,
          }));

          out.push({ demand: d, matches: matchesWithStatus });
        }

        setItems(out);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedSlug = params.get('selected');
    
    if (selectedSlug) {
      const demand = items.find(
        ({ demand }) => demand.title.toLowerCase().replace(/\s+/g, '-') === selectedSlug
      );

      if (demand) {
        setSelectedDemand(demand.demand);
        setSelectedMatches(demand.matches);
        setViewingDemand(true);
      }
    }
  }, [location.search, items]);

  const handleSelectDemand = (demand: Demand, matches: Match[]) => {
    setSelectedDemand(demand);
    setSelectedMatches(matches);
    setViewingDemand(true);

    const slug = demand.title.toLowerCase().replace(/\s+/g, '-');
    const params = new URLSearchParams(location.search);
    params.set('tab', 'match');
    params.set('selected', slug);

    navigate(`/user/client/hem?${params.toString()}`);
  };

  const handleBackToList = () => {
    setViewingDemand(false);
    setSelectedDemand(null);
    setSelectedMatches([]);

    const params = new URLSearchParams(location.search);
    params.delete('selected');
    navigate(`/user/client/hem?${params.toString()}`, { replace: true });
  };


  const handleUnmatchAll = async () => {
    if (!selectedDemand) return;
  
    try {
      for (const match of selectedMatches) {
        await updateMatchStatus(selectedDemand.demandId, match.id ?? match.demandId, "new");
      }
  
      // 🔄 Hämta om datan efter uppdatering
      const resp = await fetchMyDemands();
      const myDemands: Demand[] = resp.data || [];
  
      const updatedItems: { demand: Demand; matches: Match[] }[] = [];
  
      for (const d of myDemands) {
        if (!Array.isArray(d.matches) || d.matches.length === 0) continue;
  
        const matchedIds: string[] = [];
        const statusMap: Record<string, string> = {};
  
        for (const m of d.matches) {
          const id = typeof m === 'object' ? m.id : m;
          const status = typeof m === 'object' ? m.status : 'new';
          if (id && status === 'matched') {
            matchedIds.push(id);
            statusMap[id] = status;
          }
        }
  
        if (matchedIds.length === 0) continue;
  
        const matchesResp = await fetchDemandsByIds(matchedIds);
        const fetched = Array.isArray(matchesResp.data)
          ? matchesResp.data
          : [matchesResp.data];
  
        const matchesWithStatus = fetched.map((md: any) => ({
          ...md,
          status: statusMap[md.demandId] || 'matched',
          demand: md.demand,
          organisation: md.organisation,
        }));
  
        updatedItems.push({ demand: d, matches: matchesWithStatus });
      }
  
      setItems(updatedItems); // 👈 Uppdatera listan
  
      // 🔙 Tillbaka till listan
      handleBackToList();
    } catch (error) {
      console.error("Misslyckades att ångra matchningar:", error);
    }
  };
  
  


  if (loading) return <div>Laddar aktiva samarbeten...</div>;
  if (error) return <div>Fel: {error}</div>;
  if (items.length === 0) return <div>Inga aktiva samarbeten hittades.</div>;

  if (viewingDemand && selectedDemand) {
    // Viewing a specific demand
    return (
      <div>
        <div className="bg-white p-5 rounded-xl shadow-md relative">
          <h2 className="text-2xl font-bold mb-4 capitalize">{selectedDemand.title}</h2>
          <p className="text-[18px] text-gray-600 mb-4">{selectedDemand.demand}</p>

          <h3 className="text-2xl font-semibold capitalize">
            Matchat Med: {selectedMatches.map(m => m.title).join(', ')}
          </h3>
          {selectedMatches.length === 0 ? (
            <p>Inga aktiva samarbeten.</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {selectedMatches.map((match) => (
                <li key={match.demandId} className="text-sm text-gray-700">
                  <p className='text-[18px] capitalize'>{match.demand}</p>
                  <div className="text-xs text-gray-500">
                    Skapad av: {match.author || 'okänd'}
                  </div>
                </li>
              ))}
            </ul>
          )}

<div className="flex justify-between mt-6">
  <Button
    onClick={handleBackToList}
    label="Tillbaka till lista"
    variant="secondary"
    className="py-1.5 px-4"
  />
  <Button
    onClick={handleUnmatchAll}
    label="Ångra matchning"
    variant="danger"
    className="py-1.5 px-4 bg-red-600 text-white hover:bg-red-700"
  />
</div>

        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Aktiva Samarbeten</h2>
      <ul className="space-y-4">
        {items.map(({ demand, matches }) => (
          <li key={demand.demandId} className="border p-4 rounded-xl shadow-sm bg-white">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-2xl capitalize">{demand.title}</p>
              <p className="text-xs text-gray-700">
                Skapad: {new Date(demand.createdAt).toLocaleString()}
              </p>
            </div>

            <p className="text-sm text-gray-600 mt-1 truncate">
              {demand.demand}
            </p>

            <div className="mt-4">
              <h3 className="text-lg font-semibold">Matchat Med:</h3>
              {matches.length === 0 ? (
                <p>Inga aktiva samarbeten.</p>
              ) : (
                <ul className="space-y-2 mt-2">
                  {matches.map((match) => (
                    <li key={match.demandId} className="flex justify-between items-center text-sm text-gray-700">
                      <span className='capitalize'>{match.title} - {match.status}</span>
                      <div className="flex justify-end mt-2">
                        <Button
                          onClick={() => handleSelectDemand(demand, matches)}
                          label="Välj"
                          className="py-1.5 px-4"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AcceptedDemands;
