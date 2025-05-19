import { useState, useEffect } from "react";
import { fetchAllDemands } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import DemandCard from "../demand/DemandCard";
import useUser from "../../store/useUser";

interface Demand {
  title: string;
  demand: string;
  category: string;
  author: string;
}

interface AllDemandsProps {
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
}

const AllDemands = ({ searchQuery, currentPage, itemsPerPage }: AllDemandsProps) => {
  const { user } = useUser();
  const [filteredDemands, setFilteredDemands] = useState<Demand[]>([]);

  useEffect(() => {
    const fetchDemands = async () => {
      const allDemands = await fetchAllDemands();
      const otherDemands = allDemands.data.filter(
        (demand: Demand) => demand.author !== user?.email
      );

      const searchInFields = (fields: string[], searchTerm: string): boolean => {
        const words = searchTerm.trim().toLowerCase().split(/\s+/);
        return words.every((word) =>
          fields.some((field) => field.toLowerCase().includes(word))
        );
      };

      const searchedDemands = otherDemands.filter((demand: { title: string; demand: string; category: string }) =>
        searchInFields(
          [demand.title, demand.demand, demand.category],
          searchQuery
        )
      );

      setFilteredDemands(searchedDemands);
    };

    fetchDemands();
  }, [searchQuery, user]);

  const startIndex = currentPage * itemsPerPage;
  const paginatedDemands = filteredDemands.slice(startIndex, startIndex + itemsPerPage);

  return (
    <ListComponent
      fetchFunction={async () => ({ data: paginatedDemands })}
      title="Alla behov"
      renderItem={(demand: Demand) => (
        <DemandCard
          title={demand.title}
          demand={demand.demand}
          category={demand.category}
          author={demand.author}
        />
      )}
    />
  );
};

export default AllDemands;
