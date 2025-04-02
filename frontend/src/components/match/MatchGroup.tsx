import React, { useState } from "react";
import DemandCard from "../demand/DemandCard";
import MatchCard from "./MatchCard";

interface MatchData {
  demandId: string;
  title?: string;
  demand?: string;
  category?: string;
  author?: string;
  status: "new" | "confirmedByMe" | "confirmedByThem" | "matched" | "rejectedByMe";
}

interface Demand {
  demandId: string;
  title: string;
  demand: string;
  category: string;
  author: string;
}

interface MatchGroupProps {
  demand: Demand;
  matches: MatchData[];
  onConfirmMatch: (demandId: string, matchId: string) => void;
  onRejectMatch: (demandId: string, matchId: string) => void;
  onCancelAction: (demandId: string, matchId: string, status: string) => void;
  onDeleteDemand?: () => void;
}

const MatchGroup: React.FC<MatchGroupProps> = ({
  demand,
  matches,
  onConfirmMatch,
  onRejectMatch,
  onCancelAction,
  onDeleteDemand,
}) => {
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(-1);
  const [activeConfirmedIndex, setActiveConfirmedIndex] = useState<number>(-1);
  const demandId = demand.demandId;

  const confirmedMatches = matches.filter((match) => match.status === "matched");
  const otherMatches = matches.filter((match) => match.status !== "matched");

  return (
    <div className="w-full max-w-5xl p-12 mb-12 border-2 border-dashed border-neutral-900 rounded-lg">
      <div className="flex flex-col">
        <DemandCard
          title={demand.title}
          demand={demand.demand}
          category={demand.category}
          author={demand.author}
          demandId={demand.demandId}
          onDelete={onDeleteDemand}
          className="mb-4"
          initialExpanded={true}
        />

        {confirmedMatches.length > 0 && (
          <div className="flex flex-col mt-4">
            <h4 className="text-green-700 border-b border-green-700 pb-2 mt-0 text-lg font-semibold">
              Active Collaborations:
            </h4>
            <div className="flex relative mt-2">
              {confirmedMatches.map((match, index) => (
                <MatchCard
                  key={`confirmed-${match.demandId}`}
                  matchData={match}
                  className={`ml-[-50%] first:ml-0 w-[85%]`}
                  isStackable={true}
                  isOnTop={activeConfirmedIndex === index}
                  onSelect={() => setActiveConfirmedIndex(index)}
                  initialExpanded={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {otherMatches.length > 0 && (
        <div className="flex flex-col mt-8">
          <h4 className="text-blue-600 border-b border-blue-600 pb-2 text-lg font-semibold">
            Potential Matches:
          </h4>
          <div className="flex flex-col-reverse">
            {otherMatches.map((match, index) => (
              <MatchCard
                key={`other-${match.demandId}`}
                matchData={match}
                className="my-2"
                isStackable={true}
                isOnTop={activeMatchIndex === index}
                onSelect={() => setActiveMatchIndex(index)}
                onConfirm={() => onConfirmMatch(demandId, match.demandId)}
                onReject={() => onRejectMatch(demandId, match.demandId)}
                onCancel={() => onCancelAction(demandId, match.demandId, match.status)}
                initialExpanded={false}
              />
            ))}
          </div>
        </div>
      )}

      {otherMatches.length === 0 && confirmedMatches.length === 0 && (
        <p className="mt-8 p-5 text-center italic text-neutral-600 bg-neutral-100 rounded-md">
          No matches found for this demand.
        </p>
      )}
    </div>
  );
};

export default MatchGroup;
