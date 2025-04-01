import React from "react";
import { fetchAllDemands } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import DemandCard from "../demand/DemandCard";

const AllDemands = () => {
  return (
    <ListComponent
      fetchFunction={fetchAllDemands}
      title="All demands"
      renderItem={(demand) => (
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
