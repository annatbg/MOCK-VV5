import CreateDemandForm from "../../components/forms/createDemand/CreateDemand";
import MyDemands from "../../components/list/MyDemands";
import AllDemands from "../../components/list/AllDemands";

const DemandsView = () => {
  return (
    <div className="flex flex-col w-full overflow-y-auto p-6 ">
      <h1 className="text-3xl font-bold ">Demands</h1>
      <CreateDemandForm />
      <MyDemands />
      <AllDemands />
    </div>
  );
};

export default DemandsView;

