import { useState } from "react";
import DemandCard from "../demand/DemandCard";
import MatchCard from "./MatchCard";
import Pagination from "../pagination/Pagination";

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
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<string>(""); // Filter state
  const matchesPerPage = 2;
  const demandId = demand.demandId;

  // Filter matches based on user input
  const filteredMatches = matches.filter(
    (m) =>
      m.status !== "matched" &&
      (m.title?.toLowerCase().includes(filter.toLowerCase()) ||
        m.demand?.toLowerCase().includes(filter.toLowerCase()) ||
        m.category?.toLowerCase().includes(filter.toLowerCase()))
  );

  // Paginate the filtered matches
  const paginatedMatches = filteredMatches.slice(
    currentPage * matchesPerPage,
    (currentPage + 1) * matchesPerPage
  );

  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full mb-12 border border-gray-300 rounded-lg shadow-lg bg-white">
      <div className="p-6">
        <DemandCard
          title={demand.title}
          demand={demand.demand}
          category={demand.category}
          author={demand.author}
          demandId={demand.demandId}
          onDelete={onDeleteDemand}
          initialExpanded={false}
        />

        {/* Filter input */}
        <div className="mt-4">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Filtrera matchningar..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {paginatedMatches.length > 0 && (
          <div className="mt-8">
            <h4 className="text-xl font-semibold text-lightGreen border-b border-lightGreen pb-2">
              Matchningar:
            </h4>
            <div className="grid gap-4 mt-4">
              {paginatedMatches.map((match) => (
                <MatchCard
                  key={match.demandId}
                  matchData={match}
                  isStackable
                  isOnTop={false}
                  onSelect={() => {}}
                  onConfirm={() => onConfirmMatch(demandId, match.demandId)}
                  onReject={() => onRejectMatch(demandId, match.demandId)}
                  onCancel={() => onCancelAction(demandId, match.demandId, match.status)}
                  initialExpanded={false}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalItems={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}

        {filteredMatches.length === 0 && (
          <p className="mt-8 p-5 text-center italic text-darkText bg-gray-100 rounded-lg">
            Inga matchningar hittades för denna förfrågan.
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchGroup;
