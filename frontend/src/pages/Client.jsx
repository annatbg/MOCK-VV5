import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/header/mainHeader/MainHeader";
import PageNav from "../components/nav/PageNav/PageNav";
import MainFooter from "../components/footer/mainFooter/MainFooter";
import useUser from "../store/useUser";
import HomeUser from "../views/homeUser";
import MatchUser from "../views/matchUser";
import DemandsUser from "../views/demandsUser";
import ProfileUser from "../views/profileUser";
import SettingsUser from "../views/settingsUser";
import "./styles/UserPage.css";

function Client() {
  const user = useUser((state) => state.user);
  const role = useUser((state) => state.role);
  const logout = useUser((state) => state.logout);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("home");

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
    console.log("Logged out");
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
    if (role !== "client") {
      navigate("/");
    }
  }, [user, navigate]);

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <HomeUser />;
      case "profile":
        return <ProfileUser />;
      case "settings":
        return <SettingsUser />;
      case "demands":
        return <DemandsUser />;
      case "match":
        return <MatchUser />;
      default:
        return <HomeUser />;
    }
  };

  return (
    <>
      {user && (
        <div className="userPage">
          <MainHeader />
          <div className="contentPage">
            <PageNav setActiveView={setActiveView} activeView={activeView} />
            {renderView()}
          </div>
          <MainFooter />
        </div>
      )}
    </>
  );
}

export default Client;
