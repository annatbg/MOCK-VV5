import React, { useState, useCallback, useEffect } from "react";
import { fetchMyDemands, deleteDemand } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import DemandCard from "../demand/DemandCard";

interface Demand {
  title: string;
  demand: string;
  category: string;
  author: string;
  demandId: string;
}

const MyDemands: React.FC = () => {
  const [demands, setDemands] = useState<Demand[]>([]);

  useEffect(() => {
    const fetchDemands = async () => {
      try {
        const response = await fetchMyDemands();
        setDemands(response.data);
      } catch (error) {
        console.error("Error fetching demands:", error);
      }
    };
    fetchDemands();
  }, []);

  const handleDelete = async (demandId: string) => {
    if (window.confirm("Are you sure you want to delete this demand?")) {
      try {
        await deleteDemand(demandId);
        setDemands((prevDemands) => prevDemands.filter((d) => d.demandId !== demandId)); 
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
      renderItem={(demand: Demand) => (
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