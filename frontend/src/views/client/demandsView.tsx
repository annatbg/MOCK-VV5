import React from "react";
import CreateDemandForm from "../../components/forms/createDemand/CreateDemand";
import MyDemands from "../../components/list/MyDemands";
import AllDemands from "../../components/list/AllDemands";

const DemandsView = () => {
  return (
    <div className="flex flex-col w-full overflow-y-auto pl-10 text-[22px]">
      <h1 className="text-3xl font-bold mb-4">Demands</h1>
      <CreateDemandForm />
      <MyDemands />
      <AllDemands />
    </div>
  );
};

export default DemandsView;

