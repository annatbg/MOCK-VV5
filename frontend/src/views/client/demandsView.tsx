import { useState } from "react";
import CreateDemandForm from "../../components/forms/createDemand/CreateDemand";
import MyDemands from "../../components/list/MyDemands";
import AllDemands from "../../components/list/AllDemands";
import Button from "../../components/button/Button";

const DemandsView = () => {
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => setShowForm((prev) => !prev);

  return (
    <div className="flex flex-col w-full overflow-y-auto p-6 gap-4">
      <h1 className="text-3xl font-bold">Demands</h1>

      {/* Toggle Button */}
      <Button
        onClick={toggleForm}
        label={showForm ? "Close form" : "Create demand"}
        variant={showForm ? "danger" : "primary"}
        className="w-40 h-12"
      />

      {/* Only show form when toggled */}
      {showForm && (
        <CreateDemandForm onClose={toggleForm} />
      )}

      <MyDemands />
      <AllDemands />
    </div>
  );
};

export default DemandsView;
