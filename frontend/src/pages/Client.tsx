import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUser from "../store/useUser";
import HomeView from "../views/client/homeView";
import DemandsView from "../views/client/demandsView";
import MatchView from "../views/client/matchView";
import ProfileView from "../views/client/profileView";
import Sidebar from "../components/sidebar/Sidebar";
import NotificationsView from "../views/client/notificationsView";
import bgImg from '../assets/Varmland_landscapeV2.svg';

function Client() {
  const user = useUser((state) => state.user);
  const navigate = useNavigate();
  const { activeView } = useParams(); // Get activeView from URL params

  useEffect(() => {
    if (!user || user.role !== "client") {
      navigate("/");
    }
  }, [user, navigate]);

  const renderView = () => {
    switch (activeView) {
      case "hem":
        return <HomeView />;
      case "profil":
        return <ProfileView />;
      case "match":
        return <MatchView />;
      case "demands":
        return <DemandsView />;
      case "notiser":
        return <NotificationsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="relative flex flex-col w-full bg-[#ede0d4]">
      
      <div className="relative flex flex-row h-screen">
        <Sidebar activeView={activeView || "home"} />
        {renderView()}
      </div>
    </div>
  );
}

export default Client;
