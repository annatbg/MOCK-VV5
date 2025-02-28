import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";
import useUser from "../../store/useUser";



const Sidebar = ({ activeView, setActiveView }) => {
  
  const user = useUser((state) => state.user);
  const logout = useUser((state) => state.logout);  
  const navigate = useNavigate();


  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
    console.log("Logged out");
  };


  return (
    <nav id="sidebar">
      <ul className="sidebarNavList">
        <li>
          <svg
            className="logo"
            width="163"
            height="43"
            viewBox="0 0 163 43"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_112_306)">
              <path
                d="M134.427 17.8485C134.531 14.5577 136.632 12.3149 139.251 12.3149C139.917 12.2986 140.579 12.4446 141.187 12.7422C141.796 13.0397 142.334 13.4812 142.765 14.0342L134.427 17.8485ZM143.006 21.589C142.626 22.2975 142.076 22.8805 141.415 23.2756C140.753 23.6707 140.005 23.8629 139.251 23.8318C138.514 23.8421 137.785 23.6609 137.126 23.3033C136.467 22.9457 135.896 22.4222 135.461 21.7763L148.001 16.0536C147.139 10.8929 143.558 7.97674 139.284 7.97674C134.254 7.97674 130.189 12.5384 130.189 18.1119C130.176 19.421 130.401 20.72 130.851 21.9345C131.302 23.1491 131.969 24.2552 132.813 25.1896C133.658 26.124 134.664 26.8683 135.775 27.3798C136.885 27.8913 138.077 28.16 139.284 28.1704C143.693 28.1704 146.829 25.5154 147.863 21.5894L143.006 21.589ZM128.773 8.0885C122.882 7.30392 119.403 11.1163 119.403 16.5775V27.7216H123.95V16.5775C123.95 13.8488 125.879 12.1656 128.773 12.7253V8.0885ZM110.996 18.1489C110.996 21.1388 108.964 23.5707 106.449 23.5707C103.935 23.5707 101.902 21.2143 101.902 18.1489C101.902 14.9699 103.933 12.614 106.449 12.614C108.965 12.614 110.996 15.0817 110.996 18.1489ZM115.546 18.1114C115.546 12.5384 111.791 7.97626 106.451 7.97626C101.076 7.97626 97.3215 12.5379 97.3215 18.1114C97.3215 23.6445 101.146 28.132 105.831 28.132C106.839 28.1643 107.843 27.9644 108.775 27.5456C109.708 27.1267 110.548 26.4983 111.241 25.7018V27.7216H115.546V18.1114ZM90.7078 18.0358C90.7078 21.1768 88.6743 23.5707 86.1585 23.5707C83.6433 23.5707 81.6117 21.103 81.6117 18.0358C81.6117 15.0437 83.6445 12.614 86.1585 12.614C88.6724 12.614 90.7078 14.9324 90.7078 18.0358ZM95.2552 18.0358C95.2552 12.5022 91.4991 7.97674 86.1585 7.97674C80.7857 7.97674 77.0296 12.5013 77.0296 18.0358V36.2844H81.6123V25.8892C82.2851 26.629 83.0916 27.2101 83.9812 27.596C84.8703 27.982 85.8237 28.1644 86.7808 28.132C91.4676 28.132 95.2571 23.6074 95.2571 18.0358H95.2552ZM73.4803 16.5775C73.4803 11.5304 70.5515 7.97674 65.5917 7.97674C64.5236 7.96148 63.4655 8.19787 62.4901 8.66962C61.5147 9.14131 60.6452 9.8372 59.9415 10.7091C59.2492 9.82228 58.3815 9.11619 57.4036 8.64341C56.425 8.17056 55.3613 7.94314 54.2913 7.97811C49.4336 7.97811 46.2976 11.681 46.2976 16.5789V27.7216H50.8467V16.4657C50.8467 14.2971 52.2582 12.8009 54.2913 12.8009C57.2882 12.8009 57.5978 15.3799 57.5978 16.4657V27.7216H62.1465V16.4657C62.1465 14.2971 63.5942 12.8009 65.593 12.8009C68.5899 12.8009 68.9342 15.3799 68.9342 16.4657V27.7216H73.4816L73.4803 16.5775Z"
                fill="#000"
              />
              <path
                d="M23.4295 21.3049H18.6517C18.3067 22.0537 17.7824 22.6819 17.1366 23.1205C16.4907 23.5591 15.7484 23.7909 14.9916 23.7904C12.5188 23.7904 10.5188 21.2672 10.5188 18.2181C10.5188 15.0911 12.5188 12.5318 14.9916 12.5318C15.7376 12.5425 16.4674 12.7751 17.1051 13.2055C17.7429 13.6359 18.2651 14.2482 18.6177 14.979H23.3951C22.3791 10.6104 19.1933 7.97461 14.9916 7.97461C9.73893 7.97461 5.97754 12.5683 5.97754 18.1807C5.97754 23.7932 9.73893 28.3098 14.9916 28.3098C19.2278 28.3098 22.4127 25.7123 23.4295 21.3049Z"
                fill="black"
              />
              <path
                d="M26.4385 14.9789H31.2157C31.5608 14.2299 32.0854 13.6015 32.7316 13.1629C33.3778 12.7244 34.1204 12.4928 34.8775 12.4938C37.3499 12.4938 39.3497 15.0171 39.3497 18.0659C39.3497 21.193 37.3499 23.7524 34.8775 23.7524C34.1316 23.7417 33.4019 23.5091 32.7642 23.0788C32.1266 22.6485 31.6044 22.0362 31.2518 21.3056H26.4733C27.4892 25.6738 30.6746 28.3098 34.8775 28.3098C40.1295 28.3098 43.8905 23.7164 43.8905 18.1032C43.8905 12.4901 40.1275 7.97461 34.8775 7.97461C30.6418 7.97461 27.4572 10.5718 26.4405 14.9789"
                fill="black"
              />
            </g>
            <defs>
              <clipPath id="clip0_112_306">
                <rect
                  width="42.2653"
                  height="163"
                  fill="white"
                  transform="matrix(0 -1 1 0 0 42.2654)"
                />
              </clipPath>
            </defs>
          </svg>
        </li>

        <div className="sidebarContainer">
          <div id="sidebarList">
        <li
          className={activeView === "home" ? "active" : ""}
          onClick={() => setActiveView("home")}
          
        >
          <svg
            viewBox="0 -960 960 960"
          >
            <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
          </svg>
          <span className="sidebarTitle">Home</span>
        </li>
          </div>
        <div id="sidebarList">
        <li
          className={activeView === "profile" ? "active" : ""}
          onClick={() => setActiveView("profile")}
          
        >
          <svg
            viewBox="0 -960 960 960"
          >
            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
          </svg>
          <span>Profile</span>
        </li>
        </div>

        <div id="sidebarList">
        <li
          className={activeView === "demands" ? "active" : ""}
          onClick={() => setActiveView("demands")}

        >
          <svg
            viewBox="0 -960 960 960"
          >
            <path d="M360-240h440v-107H360v107ZM160-613h120v-107H160v107Zm0 187h120v-107H160v107Zm0 186h120v-107H160v107Zm200-186h440v-107H360v107Zm0-187h440v-107H360v107ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Z" />
          </svg>
          <span>Demands</span>
        </li>
        </div>

        <div id="sidebarList">
        <li
          className={activeView === "match" ? "active" : ""}
          onClick={() => setActiveView("match")}

        >
          <svg
            viewBox="0 -960 960 960"
          >
            <path d="M320-200q-117 0-198.5-81.5T40-480q0-117 81.5-198.5T320-760q27 0 52.5 5t49.5 14q-17 14-32 30.5T362-676q-10-2-20.5-3t-21.5-1q-83 0-141.5 58.5T120-480q0 83 58.5 141.5T320-280q11 0 21.5-1t20.5-3q13 18 28 34.5t32 30.5q-24 9-49.5 14t-52.5 5Zm320 0q-27 0-52.5-5T538-219q17-14 32-30.5t28-34.5q11 2 21 3t21 1q83 0 141.5-58.5T840-480q0-83-58.5-141.5T640-680q-11 0-21 1t-21 3q-13-18-28-34.5T538-741q24-9 49.5-14t52.5-5q117 0 198.5 81.5T920-480q0 117-81.5 198.5T640-200Zm-160-50q-57-39-88.5-100T360-480q0-69 31.5-130T480-710q57 39 88.5 100T600-480q0 69-31.5 130T480-250Z" />
            
          </svg>

          <span>Match</span>

        </li>
        </div>

        </div>
      </ul>
        <div className="sidebar-logout">
        <li className="sidebar-username">
          {user.firstName} {user.lastName}
        </li>
        <li className="sidebar-button-container">
          <button
            onClick={handleLogout}
            className="contentPage__user-logoutBTN"
          >
            <img
              className="sidebar-logout-logo"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAACSElEQVR4nO2dTWoVQRSFPx3kKbgB4w6jZqg7UHDiwFFG7sGBuIKYDDRuQhAcaSLB0ZEHNXAgCfK66p7XdT44w26qPi63f6rohhBCCCGEEEJYCRvgGDgDrgDtSa7amJ8AB5jzCPhiIE075qLNxbaS1yBZLZ9dK/vYQI4WzmMMOTcQo4XzEUMuDcRo4WznZIdWGjuqhSii62UpFV0vUmkdWMSOaiGK6HpZSkXXi1RaBxaxo1qIIrpellLR9SKV1oFF7KgWooiul6VU9Dpax33gpC3wfgdetaW9tA6WFX3yj+Pe95I9a0XfuWF1qYvsmVvHzxuOX1z2zKJf33KORWXPLHrTZA6RPbNo2mabd7ec6wNwjx2ZXfQw2dVCZCB6iOxqITIR3V12tRAZie4qu1qIzER3kz1y8r+BZ8DhjiJc5vVft34jRT/v67ZkXi/dBiTgYV+3JfP65jYgDWoZo+f11W1AWmnreOE2ILWL4VZ2LoYrytS3d9oD0Xlgob/oPILTv6LzUon+rSOvSenfo/Pin/4XwyxlMeau480t58jiLLuLvgv8GiWZhe9dtWeir0dJnln0lrejJDO56AdN9nXbHrbdUJNNjiwv+u99eN2ZuaKHUi1EEV0vS6noepFK68AidlQLUUTXy1Iqul6k0jqwiB3VQhTR9bKUiq4XqbQOLGJHtRDNInqNH4H9gSFnBmK0cE4x5KmBGC2cIwzZtG/jayX55PrpedoPCC5WIvkQcw7aLzZO9+wCednGfORcySGEEEIIIYRABX8AauG3G/2c6pcAAAAASUVORK5CYII="
              alt="Test Image"
              width="30"
              height="30"
            />
            Log out
          </button>
        </li>

        </div>
    </nav>
  );
}

export default Sidebar;


