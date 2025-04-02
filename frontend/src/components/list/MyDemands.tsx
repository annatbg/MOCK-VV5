import { useState } from "react";
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

const MyDemands = () => {
  const [demands, setDemands] = useState<Demand[]>([]);

  const handleDelete = async (demandId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this demand?");
    if (!confirmed) return;

    try {
      await deleteDemand(demandId);
      setDemands((prev) => prev.filter((d) => d.demandId !== demandId));
      alert("Demand deleted successfully");
    } catch (err) {
      console.error("Error deleting demand:", err);
    }
  };

  return (
    <ListComponent
      fetchFunction={async () => {
        const response = await fetchMyDemands();
        setDemands(response.data);
        return { data: demands };
      }}
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
