import { useState } from "react";
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

const MatchGroup = ({
  demand,
  matches,
  onConfirmMatch,
  onRejectMatch,
  onCancelAction,
  onDeleteDemand,
}: MatchGroupProps) => {
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1);
  const [activeConfirmedIndex, setActiveConfirmedIndex] = useState(-1);
  const demandId = demand.demandId;

  const confirmedMatches = matches.filter((m) => m.status === "matched");
  const otherMatches = matches.filter((m) => m.status !== "matched");

  return (
    <div className="w-full  mb-12 border border-slate-900 rounded-md">
      <div className="flex flex-col">
        <DemandCard
          title={demand.title}
          demand={demand.demand}
          category={demand.category}
          author={demand.author}
          demandId={demand.demandId}
          onDelete={onDeleteDemand}
          initialExpanded
        />

        {confirmedMatches.length > 0 && (
          <div className="flex flex-col mt-4">
            <h4 className="text-green-700 border-b border-green-700 pb-2 text-lg font-semibold">
              Aktiva Sammarbeten:
            </h4>
            <div className="flex relative mt-2">
              {confirmedMatches.map((match, index) => (
                <MatchCard
                  key={`confirmed-${match.demandId}-${index}`}
                  matchData={match}
                  isStackable
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
            Potential Match:
          </h4>
          <div className="flex flex-col-reverse gap-2">
            {otherMatches.map((match, index) => (
              <MatchCard
                key={`other-${match.demandId}-${index}`}
                matchData={match}
                isStackable
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

      {confirmedMatches.length === 0 && otherMatches.length === 0 && (
        <p className="mt-8 p-5 text-center italic text-neutral-600 bg-neutral-100 rounded-md">
          Inga matchningar hittades för denna förfrågan.
        </p>
      )}
    </div>
  );
};

export default MatchGroup;
