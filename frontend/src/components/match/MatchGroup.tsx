import { useState, useEffect } from "react";
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
  const [debouncedFilter, setDebouncedFilter] = useState<string>(""); // For debouncing
  const matchesPerPage = 2;
  const demandId = demand.demandId;

  // Use effect to debounce the filter value (wait until user stops typing for 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter); // Update debounced filter after 500ms
    }, 500);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount or filter change
  }, [filter]);

  // Function to search if all words in the search term are present in the text
  const searchInFields = (text: string, searchTerm: string): boolean => {
    const words = searchTerm
      .trim()
      .split(/[\s,]+/) // Split by space or comma
      .filter(word => word.length > 0); // Remove empty strings

    return words.every(word => text.toLowerCase().includes(word.toLowerCase()));
  };

  // Filter matches based on debounced input
  const filteredMatches = matches
    .filter(
      (m) =>
        m.status !== "matched" && // Exclude matches with status "matched"
        (
          searchInFields(m.title ?? "", debouncedFilter) ||
          searchInFields(m.demand ?? "", debouncedFilter) ||
          searchInFields(m.category ?? "", debouncedFilter) ||
          searchInFields(m.author ?? "", debouncedFilter)
        )
    )
    .sort((a, b) => {
      // Prioritize confirmed interest statuses: "confirmedByMe" and "confirmedByThem"
      if (a.status === "confirmedByMe" || a.status === "confirmedByThem") return -1;
      if (b.status === "confirmedByMe" || b.status === "confirmedByThem") return 1;

      // Then prioritize "new" status over others
      if (a.status === "new") return -1;
      if (b.status === "new") return 1;

      return 0; // Default sorting for other statuses
    });

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
    <div className="w-full mb-7 border border-gray-300 rounded-lg shadow-lg bg-white">
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

        {/* Matchningar */}
        {filteredMatches.length > 0 ? (
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
                onPageChange={handlePageChange} itemsPerPage={0}              />
            )}
          </div>
        ) : (
          <div className="mt-8">
            <h4 className="text-gray-500">Inga matchningar hittades..</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchGroup;
