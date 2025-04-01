import React from "react";
import { Home, List, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUser from "../../store/useUser";
import logo from '../../assets/Group 2 (1).svg'

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
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
    <div className="h-screen bg-darkGreen text-white flex flex-col items-center justify-center p-4 text-center relative">
      <div 
        className="absolute top-2/3 left-1/2 transform -translate-x-1/2"
        style={{ width: "300px"}}
      >
        <img 
          src={logo} 
          alt="Logo" 
          className="rotate-90"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      
      <nav className="flex flex-col space-y-4 w-full items-center justify-center">
        <button 
          className={`flex flex-col items-center space-y-2 p-2 rounded-full w-full justify-center bg-lightGreen transition-transform transform hover:scale-110`}
          onClick={() => setActiveView("profile")}
        >
          <Home size={25} />
        </button>
        <button 
          className={`flex flex-col items-center space-y-2 p-2 rounded-full w-full justify-center bg-lightGreen transition-transform transform hover:scale-110`}
          onClick={() => setActiveView("demands")}
        >
          <List size={25} />
        </button>
        <button 
          className={`flex flex-col items-center space-y-2 p-2 rounded-full w-full justify-center bg-lightGreen transition-transform transform hover:scale-110`}
          onClick={() => setActiveView("match")}
        >
          <Users size={25} />
        </button>
      </nav>
      <div className="mt-auto flex flex-col items-center w-full justify-center">
        <button 
          onClick={handleLogout} 
          className="flex flex-col items-center p-2 rounded-full hover:bg-red-700 w-full justify-center bg-lightGreen transition-transform transform hover:scale-110"
        >
          <LogOut size={25} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;