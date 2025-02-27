import React from "react";
import CreateDemandForm from "../../components/forms/createDemand/CreateDemand";
import MyDemands from "../../components/list/MyDemands";
import AllDemands from "../../components/list/AllDemands";
import "./styles/DemandsView.css";

const DemandsView = () => {
  return (
    <div className="demandViewContainer">
      <h1 className="demandViewTitle">Demand View</h1>
      <CreateDemandForm />
      <MyDemands />
      <AllDemands />
    </div>
  );
};

export default DemandsView;
