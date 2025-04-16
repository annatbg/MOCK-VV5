import useUser from "../../store/useUser";
import Tabs from "../../components/tabs/tabs";


const HomeView = () => {
  const { user } = useUser();


  const organisationName = user?.organisation || "No organisation";
  // const hasOrganisation = user?.organisation && user.organisation.trim() !== "";

  return (
    <div className="flex flex-col w-full overflow-y-auto p-6 items-center gap-4">
      <div>
      {organisationName ? (
      <h1 className="flex text-4xl font-semibold text-darkText justify-start">
      {organisationName}
      </h1>
    ) : (
      <p className="text-xl text-darkText">Du har ingen organisation</p>
    )}
      </div>
      <h1 className="text-3xl text-center text-darkText capitalize">
        Welcome {user?.firstName ? user.firstName : "Guest"}
      </h1>
      
    
      <div className="flex flex-col w-full">
      <Tabs />
      </div>

      {/* <section className="w-full h-40 bg-lightGreen rounded-md text-lightText p-4 text-lg">
        {hasOrganisation ? "You have 1 organization" : "You don't have an organization"}
      </section> */}
  
    </div>
  );
  
};

export default HomeView;
