import { useState } from "react";
import useUser from "../../store/useUser";
import Tabs from "../../components/tabs/tabs";
import CreateDemand from "../../components/forms/createDemand/CreateDemand";

const HomeView = () => {
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const organisationName = user?.organisation || "No organisation";

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
            <h1 className="text-4xl font-semibold text-darkText">
              {`Organisation: ${organisationName}`}
            </h1>
          </div>

          <h2 className="text-3xl text-center text-darkText capitalize">
            Welcome {user?.firstName ?? "Guest"}
          </h2>

          <Tabs onToggleCreate={toggleCreateForm} />
        </>
      )}
    </div>
  );
};

export default HomeView;
