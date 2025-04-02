import { Home, List, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUser from "../../store/useUser";
import logo from "../../assets/Group 2 (1).svg";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar = ({ activeView, setActiveView }: SidebarProps) => {
  const user = useUser((state) => state.user);
  const logout = useUser((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { label: "profile", icon: <Home size={22} /> },
    { label: "demands", icon: <List size={22} /> },
    { label: "match", icon: <Users size={22} /> },
  ];

  return (
    <aside className="h-screen min-w-40 bg-darkGreen text-white flex flex-col justify-between py-6 px-2 ">
      {/* Navigation */}
      <div className="flex flex-col items-center space-y-6">
      <div className="flex justify-center items-center ">
      <img src={logo} alt="Logo" className=" w-full  " />
    </div>
        {navItems.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => setActiveView(label)}
            className={`w-full h-12 flex items-center justify-center rounded-xl transition-transform hover:bg-lightGreen ${
              activeView === label ? "bg-lightGreen" : "bg-darkGreen"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="flex flex-col justify-center">
        <button
          onClick={handleLogout}
          className="w-full h-12 flex items-center justify-center rounded-xl  hover:bg-red-700 transition-transform transform hover:scale-105"
        >
          <LogOut size={22} />
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;
