import React from "react";
import { fetchAllDemands } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";

const AllDemands = () => {
  return (
    <ListComponent
      fetchFunction={fetchAllDemands}
      title="Mina Behov"
      renderItem={(demand) => (
        <>
          <h3>{demand.title}</h3>
          <p>{demand.demand}</p>
          <p>
            <strong>Kategori:</strong> {demand.category}
          </p>
          <p>
            <em>Skapad av: {demand.author}</em>
          </p>
        </>
      )}
    />
  );
};

export default AllDemands;
