import React from "react";
import TopNav from "../../nav/topNav/TopNav";
import "./MainHeader.css";

const MainHeader = () => {
  return (
    <header className="mainHeader">
      <h2 className="logo">Logo</h2>
      <TopNav />
    </header>
  );
};

export default MainHeader;
