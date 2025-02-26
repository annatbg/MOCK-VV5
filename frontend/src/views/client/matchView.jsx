import React, { useState, useEffect } from "react";
import { fetchMyDemands, fetchDemandsByIds } from "../../hooks/api/demandApi";

const MatchView = () => {
  const [matchesItems, setMatchesItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchesItems = async () => {
      console.log("[MatchView] Start fetching my demands");
      try {
        const myDemandsResponse = await fetchMyDemands();
        console.log("[MatchView] Fetched my demands response:", myDemandsResponse);

        const myDemands = myDemandsResponse.data || [];
        console.log("[MatchView] Parsed myDemands:", myDemands);

        // Filtrera ut de demands som har en icke-tom matches-array
        const demandsWithMatches = myDemands.filter((demand) => {
          const hasMatches = demand.matches && demand.matches.length > 0;
          console.log(
            `[MatchView] Demand ${demand.demandId} has matches: ${hasMatches}`,
            demand.matches
          );
          return hasMatches;
        });
        console.log("[MatchView] Demands with matches:", demandsWithMatches);

        // För varje demand med matches, hämta dess matchande demands
        const items = await Promise.all(
          demandsWithMatches.map(async (demand) => {
            console.log(
              `[MatchView] Fetching matches for demand ${demand.demandId} with IDs:`,
              demand.matches
            );
            const matchesResponse = await fetchDemandsByIds(demand.matches);
            console.log(
              `[MatchView] Fetched matches for demand ${demand.demandId}:`,
              matchesResponse
            );
            const matches = matchesResponse.data || [];
            // Logga vilka matches som faktiskt returnerats
            console.log(
              `[MatchView] Matches for ${demand.demandId} after filtering:`,
              matches.filter((match) => match.demandId !== demand.demandId)
            );
            return { demand, matches };
          })
        );
        console.log("[MatchView] Final matchesItems:", items);
        setMatchesItems(items);
      } catch (err) {
        console.error("[MatchView] Error fetching matchesItems:", err);
        setError(err.message);
      }
    };

    fetchMatchesItems();
  }, []);

  console.log("[MatchView] Rendering with matchesItems:", matchesItems);

  if (error) return <p style={{ color: "red" }}>Fel: {error}</p>;

  return (
    <div>
      <h1>MatchView</h1>
      {matchesItems.length > 0 ? (
        <ul>
          {matchesItems.map((item) => (
            <li key={item.demand.demandId}>
              <div className="demand">
                <h3>{item.demand.title}</h3>
                <p>{item.demand.demand}</p>
                <p>
                  <strong>Kategori:</strong> {item.demand.category}
                </p>
                <p>
                  <em>Skapad av: {item.demand.author}</em>
                </p>
              </div>
              <div className="matches">
                <h4>Matcher:</h4>
                <ul>
                  {item.matches
                    .filter((match) => match.demandId !== item.demand.demandId)
                    .map((match) => (
                      <li key={match.demandId}>
                        <h5>{match.title}</h5>
                        <p>{match.demand}</p>
                        <p>
                          <strong>Kategori:</strong> {match.category}
                        </p>
                        <p>
                          <em>Skapad av: {match.author}</em>
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Inga matchande krav hittades.</p>
      )}
    </div>
  );
};

export default MatchView;
