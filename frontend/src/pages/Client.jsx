import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/header/mainHeader/MainHeader";
import PageNav from "../components/nav/PageNav/PageNav";
import MainFooter from "../components/footer/mainFooter/MainFooter";
import Main from "../components/main/Main";
import useUser from "../store/useUser";
import HomeView from "../views/client/homeView";
import DemandsView from "../views/client/demandsView";
import MatchView from "../views/client/matchView";
import ProfileView from "../views/client/profileView";
import Sidebar from "../components/sidebar/Sidebar";
import "./styles/ClientPage.css";



function Client() {
  const user = useUser((state) => state.user);
  const logout = useUser((state) => state.logout);  
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("home");

  useEffect(() => {
    if (!user || user.role !== "client") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
    console.log("Logged out");
  };

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
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      {user && (
        <div className="app-container">
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
