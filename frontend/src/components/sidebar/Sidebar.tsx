import { Home, List, Users, LogOut, Menu, X, User2Icon, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUser from "../../store/useUser";
import { useState, useEffect } from "react";
import logo from "../../assets/Group 2 (2).svg";

interface SidebarProps {
  activeView: string;
}

const Sidebar = ({ activeView }: SidebarProps) => {
  const user = useUser((state) => state.user);
  const logout = useUser((state) => state.logout);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkIfMobile();
    
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { label: "home", icon: <Home size={22} /> },
    { label: "profile", icon: <User2Icon size={22} /> },
    { label: "demands", icon: <List size={22} /> },
    { label: "match", icon: <Users size={22} /> },
    { label: "notifications", icon: <Bell size={22} /> },
  ];

  const handleItemClick = (label: string) => {
    navigate(`/user/client/${label}`);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Mobile hamburger button
  const HamburgerButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-darkGreen text-white"
    >
      {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  // Mobile menu overlay
  const MobileMenu = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed left-0 top-0 h-screen w-2/3 bg-darkGreen text-white ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full justify-between py-4 px-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex justify-center items-center">
              <img src={logo} alt="Logo" className="w-full" />
            </div>
            {navItems.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => handleItemClick(label)}
                className={`w-full h-12 flex flex-col items-center justify-center rounded-xl transition-transform hover:bg-lightGreen ${activeView === label ? "bg-lightGreen" : "bg-darkGreen"}`}
              >
                {icon}
                <span className="text-sm capitalize">{label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex flex-col justify-center mb-8">
            <button
              onClick={handleLogout}
              className="flex-col w-full h-12 flex items-center justify-center rounded-xl hover:bg-red-700 transition-transform"
            >
              <LogOut size={22} />
              <span className="text-sm capitalize">log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          <HamburgerButton />
          <MobileMenu />
        </>
      ) : (
        <aside className="h-screen min-w-40 bg-darkGreen text-white flex flex-col justify-between py-6 px-2">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex justify-center items-center">
              <img src={logo} alt="Logo" className="w-full" />
            </div>
            {navItems.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => handleItemClick(label)}
                className={`w-full h-12 flex flex-col items-center justify-center rounded-xl transition-transform hover:bg-lightGreen ${activeView === label ? "bg-lightGreen" : "bg-darkGreen"}`}
              >
                {icon}
                <span className="text-sm capitalize">{label}</span>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="flex flex-col justify-center">
            <button
              onClick={handleLogout}
              className="flex-col w-full h-12 flex items-center justify-center rounded-xl hover:bg-red-700 transition-transform transform hover:scale-105"
            >
              <LogOut size={22} />
              <span className="text-sm capitalize">log out</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;
