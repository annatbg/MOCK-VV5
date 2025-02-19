import React from "react";
import CreateDemandForm from "../../components/forms/createDemand/CreateDemand";
import MyDemands from "../../components/list/MyDemands";
import AllDemands from "../../components/list/AllDemands";

const DemandsView = () => {
  return (
    <div className="demandview-container">
      <h1 className="demandview-title">Demand View</h1>
      <CreateDemandForm />
      <MyDemands />
      <AllDemands />
    </div>
  );
};

export default DemandsView;
