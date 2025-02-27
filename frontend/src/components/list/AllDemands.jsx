import React from "react";
import { fetchAllDemands } from "../../hooks/api/demandApi";
import ListComponent from "./ListComponent";
import "./Demands.css"

const AllDemands = () => {
  return (
    <ListComponent
      fetchFunction={fetchAllDemands}
      title="All demands"
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
          <div className="demandSvg">
            <p>♡ 💬</p>
          </div>
        </div>
        </>
      )}
    />
  );
};

export default AllDemands;
