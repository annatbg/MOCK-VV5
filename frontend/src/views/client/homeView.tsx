import { useState } from "react";
import useUser from "../../store/useUser";
import Tabs from "../../components/tabs/tabs";
import CreateDemand from "../../components/forms/createDemand/CreateDemand";

const HomeView = () => {
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const organisationName = user?.organisation || "Ingen organisation";

  const toggleCreateForm = () => {
    setShowCreateForm((prev) => !prev);
  };

  return (
    <div className="flex flex-col w-full overflow-y-auto p-6 items-center gap-4">
      {showCreateForm ? (
        <CreateDemand onClose={toggleCreateForm} />
      ) : (
        <>
          <div>
            <h1 className="text-5xl font-semibold text-darkText">
              {`${organisationName}`}
            </h1>
          </div>
          <Tabs onToggleCreate={toggleCreateForm} />
        </>
      )}
    </div>
  );
};

export default HomeView;
