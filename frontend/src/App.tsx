import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Client from "./pages/Client";
import NotFound from "./pages/NotFound";
import useUser from "./store/useUser";
import { ModalProvider } from "./components/modal/ModalContext";
import Modal from "./components/modal/Modal";

function App() {
  const user = useUser((state) => state.user);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      console.log(
        "Token exists but user state is empty - should re-fetch user data"
      );
    }
  }, [user]);

  return (
    <ModalProvider>
      <Router>
        <Modal /> {/* Placerar modalen i din app */}
        <Routes>
          <Route
            path="/"
            element={
              !user ? <Login /> : <Navigate to={`/user/${user.role}`} replace />
            }
          />

          <Route path="/user/client/:activeView" element={<Client />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;
