import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../store/useUser";
import HomeView from "../views/client/homeView";
import DemandsView from "../views/client/demandsView";
import MatchView from "../views/client/matchView";
import ProfileView from "../views/client/profileView";
import NotificationsView from "../views/client/notificationsView";
import Sidebar from "../components/sidebar/Sidebar";
import "./styles/ClientPage.css";

function Client() {
  const user = useUser((state) => state.user);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(() => {
    // Get the stored view from localStorage or default to "home"
    return localStorage.getItem("activeView") || "home";
  });

  useEffect(() => {
    if (!user || user.role !== "client") {
      navigate("/");
    }
  }, [user, navigate]);

  // Store activeView in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeView", activeView);
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <HomeView />;
      case "profile":
        return <ProfileView />;
      case "match":
        return <MatchView />;
      case "demands":
        return <DemandsView />;
      case "notifications":
        return <NotificationsView />;  
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      {user && (
        <div className="clientContainer">
          <div className="contentPage">
            <Sidebar setActiveView={setActiveView} activeView={activeView} />
            {renderView()}
          </div>        
        </div>
      )}
    </>
  );
}

export default Client;
