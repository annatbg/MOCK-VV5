import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../store/useUser";
import "./styles/DeveloperPage.css";
import "./styles/Page.css";

function Admin() {
  const user = useUser((state) => state.user);
  const role = useUser((state) => state.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
    if (role !== "developer") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      {user && (
        <div className="page developerPage">
          <div className="developerPage-content">
            <h1>Developer-page</h1>
          </div>
        </div>
      )}
    </>
  );
}

export default Admin;
