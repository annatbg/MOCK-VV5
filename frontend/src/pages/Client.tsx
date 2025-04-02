import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../store/useUser";
import HomeView from "../views/client/homeView";
import DemandsView from "../views/client/demandsView";
import MatchView from "../views/client/matchView";
import ProfileView from "../views/client/profileView";
import Sidebar from "../components/sidebar/Sidebar";

function Client() {
  const user = useUser((state) => state.user);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem("activeView") || "home";
  });

  useEffect(() => {
    if (!user || user.role !== "client") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem("activeView", activeView);
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <DemandsView />;
      case "profile":
        return <ProfileView />;
      case "match":
        return <MatchView />;
      case "demands":
        return <DemandsView />;
      case "notifications":
        return "";
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      {user && (
        <div className="flex flex-col w-full bg-[#ede0d4]">
          <div className="flex flex-row h-screen">
            <Sidebar setActiveView={setActiveView} activeView={activeView} />
            {renderView()}
          </div>
        </div>
      )}
    </>
  );
}

export default Client;
