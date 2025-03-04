import React, { useState, useCallback } from "react";
import { fetchMyDemands, deleteDemand } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import DemandCard from "../demand/DemandCard";

const MyDemands = () => {
  const [demands, setDemands] = useState([]);

  const handleDelete = async (demandId) => {
    if (window.confirm("Are you sure you want to delete this demand?")) {
      try {
        await deleteDemand(demandId);
        setDemands(demands.filter((d) => d.demandId !== demandId)); 
        alert("Demand deleted successfully");
        window.location.reload();
      } catch (error) {
        console.error("Error deleting demand:", error);
      }
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
          demandId={demand.demandId}
          onDelete={() => handleDelete(demand.demandId)}
        />
      )}
    />
  );
};

export default MyDemands;
