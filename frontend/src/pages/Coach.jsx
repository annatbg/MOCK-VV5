import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../store/useUser";
import "./styles/CoachPage.css";
import "./styles/Page.css";

function Admin() {
  const user = useUser((state) => state.user);
  const role = useUser((state) => state.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
    if (role !== "coach") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      {user && (
        <div className="page coachPage">
          
          <div className="coachPage-content">
            <h1>Coach-page</h1>
          </div>
        
        </div>
      )}
    </>
  );
}

export default Admin;
