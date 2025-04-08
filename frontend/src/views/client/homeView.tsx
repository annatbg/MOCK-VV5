import useUser from "../../store/useUser";

const HomeView = () => {
  const {user} = useUser()
  return (
    <div className="flex flex-col w-full overflow-y-auto p-6 items-center gap-4">
      <h1 className="text-3xl font-semibold text-center text-darkText">Welcome {user?.firstName ? user.firstName : "Guest"} </h1>
      <section className="w-full h-full bg-lightGreen rounded-md text-lightText">
        content here
      </section>
    </div>
  );
};

export default HomeView;
