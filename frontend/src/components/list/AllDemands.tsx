import React from "react";
import { fetchAllDemands } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import DemandCard from "../demand/DemandCard";

// Define the type for a demand object
interface Demand {
  title: string;
  demand: string;
  category: string;
  author: string;
}

const AllDemands: React.FC = () => {
  return (
    <ListComponent
      fetchFunction={fetchAllDemands}
      title="All demands"
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

