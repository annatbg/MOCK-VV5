import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/header/mainHeader/MainHeader";
import PageNav from "../components/nav/PageNav/PageNav";
import MainFooter from "../components/footer/mainFooter/MainFooter";
import useUser from "../store/useUser";
import HomeView from "../views/client/homeView";
import DemandsView from "../views/client/demandsView";
import MatchView from "../views/client/matchView";
import ProfileView from "../views/client/profileView";
import "./styles/ClientPage.css";

function Client() {
  const user = useUser((state) => state.user);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("home");

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
        <div className="clientPage">
          <MainHeader />
          <PageNav setActiveView={setActiveView} activeView={activeView} />
          <div className="contentPage">{renderView()}</div>
          <MainFooter />
        </div>
      )}
    </>
  );
}

export default Client;
