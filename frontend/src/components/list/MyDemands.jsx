import React, { useState } from "react";
import { fetchMyDemands, deleteDemand } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import DemandCard from "../demand/DemandCard";

const MyDemands = () => {
  const [demands, setDemands] = useState([]);

  const handleDelete = async (demandId) => {
    try {
      await deleteDemand(demandId);
      setDemands(demands.filter((d) => d.demandId !== demandId)); // Update UI
    } catch (error) {
      console.error("Error deleting demand:", error);
    }
  };

  return (
    <ListComponent
      fetchFunction={fetchMyDemands}
      title="My demands"
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

export default MyDemands;
