import React, { useState, useCallback } from "react";
import { fetchMyDemands, fetchDemandsByIds } from "../../hooks/api/demandApi";
import ListComponent from "../../components/list/ListComponent";
import DemandCard from "../../components/demand/DemandCard";
import "./styles/MatchView.css";

const MatchView = () => {
  const [activeCards, setActiveCards] = useState({});

  const fetchMatchData = useCallback(async () => {
    console.log("[MatchView] Start fetching my demands");
    try {
      const myDemandsResponse = await fetchMyDemands();
      if (!myDemandsResponse || !myDemandsResponse.data) {
        return { data: [] };
      }
      
      const myDemands = myDemandsResponse.data || [];
      const items = [];
      
      for (const demand of myDemands) {
        try {
          if (!demand || !demand.matches) {
            continue;
          }
          
          const matchIds = demand.matches;
          
          if (!matchIds || (Array.isArray(matchIds) && matchIds.length === 0)) {
            continue;
          }
          
          console.log(`[MatchView] Fetching matches for demand ${demand.demandId}`);
          
          const matchesResponse = await fetchDemandsByIds(matchIds)
            .catch(err => {
              console.error(`[MatchView] Error fetching matches for demand ${demand.demandId}:`, err);
              return null;
            });
          
          if (!matchesResponse || !matchesResponse.data) {
            continue;
          }
          
          const matches = Array.isArray(matchesResponse.data) 
            ? matchesResponse.data 
            : [matchesResponse.data];
          
          const filteredMatches = matches.filter(
            match => match && match.demandId && match.demandId !== demand.demandId
          );
          
          if (filteredMatches.length > 0) {
            items.push({ demand, matches: filteredMatches });
          }
        } catch (err) {
          console.error(`[MatchView] Error processing demand:`, err);
        }
      }
      
      return { data: items };
      
    } catch (err) {
      console.error("[MatchView] Error:", err);
      return { data: [] };
    }
  }, []);

  const renderMatchItem = (item) => {
    const demandGroupId = item.demand.demandId || Math.random().toString();
    
    return (
      <div className="match-group">
        <DemandCard
          title={item.demand.title}
          demand={item.demand.demand}
          category={item.demand.category}
          author={item.demand.author}
          className="primary-demand"
        />
        <div className="matches">
          <h4>Matchningar för behovet ovan:</h4>
          <div className="card-stack">
            {item.matches && item.matches.length > 0 ? (
              item.matches.map((match, index) => (
                <DemandCard
                  key={match.demandId || `match-${index}`}
                  title={match.title || "Unknown title"}
                  demand={match.demand || "No details available"}
                  category={match.category || "Other"}
                  author={match.author || "Unknown"}
                  className="match-item"
                  isStackable={true}
                  isOnTop={activeCards[demandGroupId] === index}
                  onSelect={() => {
                    setActiveCards(prev => ({
                      ...prev,
                      [demandGroupId]: index
                    }));
                  }}
                />
              ))
            ) : (
              <p>Inga matchningar hittades.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="match-view">
      <ListComponent
        fetchFunction={fetchMatchData}
        title="Matchade behov"
        renderItem={renderMatchItem}
      />
    </div>
  );
};

export default MatchView;
