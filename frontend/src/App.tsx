import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import Login from "./pages/Login";
import Client from "./pages/Client";
import NotFound from "./pages/NotFound";
import useUser from "./store/useUser";
import { ModalProvider } from "./components/modal/ModalContext";
import Modal from "./components/modal/Modal";

interface JwtPayload {
  exp: number;
}

function AppRoutes() {
  const user = useUser((state) => state.user);
  const logout = useUser((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token") || useUser.getState().token;

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          console.log("Token expired");
          localStorage.removeItem("token");
          logout();
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        logout();
        navigate("/", { replace: true });
      }
    }
  }, [location.pathname, logout, navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? <Login /> : <Navigate to={`/user/${user.role}/hem`} replace />
        }
      />
      <Route path="/user/client/:activeView" element={<Client />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ModalProvider>
      <Router>
        <Modal />
        <AppRoutes />
      </Router>
    </ModalProvider>
  );
}

export default App;
