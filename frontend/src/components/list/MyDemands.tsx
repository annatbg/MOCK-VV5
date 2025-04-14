import { useState, useEffect } from "react";
import { fetchMyDemands, deleteDemand } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import DemandCard from "../demand/DemandCard";
import { useModal } from "../../components/modal/ModalContext";  

interface Demand {
  title: string;
  demand: string;
  category: string;
  author: string;
  demandId: string;
}

const MyDemands = () => {
  const [demands, setDemands] = useState<Demand[]>([]);
  const { showModal } = useModal();  

  useEffect(() => {
    const fetchDemands = async () => {
      const response = await fetchMyDemands();
      setDemands(response.data);
    };

    fetchDemands();
  }, []);  

  const handleDelete = (demandId: string) => {
    console.log("Opening confirmation modal for demand:", demandId);

    showModal(
      "Are you sure you want to delete this demand?",  
      "confirm",  
      async () => {
        console.log("Confirmed deletion for demand:", demandId);
        try {
          await deleteDemand(demandId);
          setDemands((prevDemands) => prevDemands.filter((d) => d.demandId !== demandId)); 
          showModal("Demand deleted successfully", "success");  
        } catch (err) {
          showModal(`Error deleting demand: ${(err as Error).message}`, "error");
        }
      },
      () => {
        console.log("Cancelled deletion for demand:", demandId);
      }
    );
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
