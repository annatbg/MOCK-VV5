import { useState, useEffect } from "react";
import { fetchAllDemands } from "../../hooks/api/demandApi";
import ListComponent from "../../components/list/ListComponent";
import DemandCard from "../../components/demand/DemandCard";
import useUser from "../../store/useUser";
import CreateDemandForm from "../../components/forms/createDemand/CreateDemand";
import Button from "../../components/button/Button";
import Pagination from "../../components/pagination/Pagination";

interface Demand {
  title: string;
  demand: string;
  category: string;
  author: string;
}

const DemandsView = () => {
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allDemands, setAllDemands] = useState<Demand[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDemands = async () => {
      const response = await fetchAllDemands();
      // Filtrera bort egna demands
      const filtered = response.data.filter(
        (demand: Demand) => demand.author !== user?.email
      );
      setAllDemands(filtered);
    };

    fetchDemands();
  }, [user]);

  // Funktion för sökning (som i AllDemands)
  const searchInFields = (fields: string[], searchTerm: string): boolean => {
    const words = searchTerm.trim().toLowerCase().split(/\s+/);
    return words.every((word) =>
      fields.some((field) => field.toLowerCase().includes(word))
    );
  };

  const filteredDemands = allDemands.filter((demand) =>
    searchInFields([demand.title, demand.demand, demand.category], searchQuery)
  );

  // Paginering
  const startIndex = currentPage * itemsPerPage;
  const paginatedDemands = filteredDemands.slice(startIndex, startIndex + itemsPerPage);

  const toggleForm = () => setShowForm((prev) => !prev);

  return (
    <div className="flex flex-col w-full overflow-y-auto p-6 gap-6">
      <h1 className="text-4xl font-semibold text-darkText text-center">Alla Behov</h1>

      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zm6 8l4 4"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Sök efter behov..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0); 
            }}
            className="p-2 pl-10 border border-gray-300 rounded-md text-sm w-full focus:border-green-500 focus:outline-none"
          />
        </div>

        <Button
          onClick={toggleForm}
          label={showForm ? "Stäng behov" : "Skapa behov"}
          variant={showForm ? "danger" : "primary"}
          className="py-2 px-4"
        />
      </div>

      {showForm && <CreateDemandForm onClose={toggleForm} />}

      {/* Visa demands */}
      <ListComponent
        fetchFunction={async () => ({ data: paginatedDemands })}
        title=""
        renderItem={(demand: Demand) => (
          <DemandCard
            title={demand.title}
            demand={demand.demand}
            category={demand.category}
            author={demand.author}
          />
        )}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredDemands.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default DemandsView;
