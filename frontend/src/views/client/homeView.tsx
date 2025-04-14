import useUser from "../../store/useUser";

const HomeView = () => {
  const { user } = useUser();

  const hasOrganisation = user?.organisation && user.organisation.trim() !== "";

  return (
    <div className="flex flex-col w-full overflow-y-auto p-6 items-center gap-4">
      <h1 className="text-3xl font-semibold text-center text-darkText">
        Welcome {user?.firstName ? user.firstName : "Guest"}
      </h1>
      <section className="w-full h-full bg-lightGreen rounded-md text-lightText p-4 text-lg">
        {hasOrganisation ? "You have 1 organization" : "You don't have an organization"}
      </section>
    </div>
  );
};

export default HomeView;
