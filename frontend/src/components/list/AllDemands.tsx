import { fetchAllDemands } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import DemandCard from "../demand/DemandCard";

interface Demand {
  title: string;
  demand: string;
  category: string;
  author: string;
}

const AllDemands = () => {
  return (
    <ListComponent
      fetchFunction={fetchAllDemands}
      title="Alla demands"
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
