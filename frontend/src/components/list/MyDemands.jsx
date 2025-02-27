import React from "react";
import { fetchMyDemands } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";

const MyDemands = () => {
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
            <strong>Kategori:</strong> {demand.category}
          </p>
          <p className="demandAuthor">
            <em>Skapad av: {demand.author}</em>
          </p>
        </div>
        </>
      )}
    />
  );
};

export default MyDemands;
