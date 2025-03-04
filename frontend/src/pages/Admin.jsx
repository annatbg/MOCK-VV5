import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../store/useUser";
import "./styles/AdminPage.css";
import "./styles/Page.css";

function Admin() {
  const user = useUser((state) => state.user);
  const role = useUser((state) => state.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
    if (role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      {user && (
        <div className="page adminPage">
         
          <div className="adminPage-content">
            <h1>Admin-page</h1>
          </div>
         
        </div>
      )}
    </>
  );
}

export default Admin;
