import React, { useState } from "react";
import { fetchMyDemands, deleteDemand } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import Button from "../button/Button";

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
        <>
          <div className="demandCard">
          <div className="demandContent">
            <h3 className="demandTitle">{demand.title}</h3>
            <p className="demandDemand">{demand.demand}</p>
          </div>
          <p className="demandCategory">

        <div key={demand.demandId}>
          <h3>{demand.title}</h3>
          <p>{demand.demand}</p>
          <p>
            <strong>Kategori:</strong> {demand.category}
          </p>
          <p className="demandAuthor">
            <em>Skapad av: {demand.author}</em>
          </p>
        </div>
        
          <Button
            onClick={() => handleDelete(demand.demandId)}
            label="Delete"
            variant="danger"
          />
              
        
      )}
      </>
    />
  );
};

export default MyDemands;
