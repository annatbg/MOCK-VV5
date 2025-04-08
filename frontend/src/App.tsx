import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Client from "./pages/Client";
import NotFound from "./pages/NotFound";
import useUser from "./store/useUser";

function App() {
  const user = useUser((state) => state.user);

  // On app load, check if there's a stored token but no user
  // This can happen if the app was refreshed
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // You might want to verify the token with your backend here
      // and retrieve fresh user data
      console.log("Token exists but user state is empty - should re-fetch user data");
      // Ideally implement a function to fetch user data using the token
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Login /> : 
          <Navigate to={`/user/${user.role}`} replace />} />
        <Route path="/user/client" element={<Client />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
