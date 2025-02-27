import React, { useEffect, useState } from "react";
import useUser from "../../store/useUser";
import { fetchUserData, updateUser } from "../../hooks/api/userApi";
import "./styles/ProfileView.css";
const API_URL = import.meta.env.VITE_API_URL;

const ProfileView = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState("");
  const user = useUser((state) => state.user);
  const setUser = useUser((state) => state.login);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserData(user, `${API_URL}/user/fetch`);
        console.log("Fetched user data:", data);
        setUserData(data);
        setEditData(data.user);
      } catch (error) {
        console.error("Error fetching data in ProfileUser:", error);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log("editData before update:", editData);
    try {
      const result = await updateUser(editData);
      console.log("Profile updated result:", result);
      setUserData({ user: result.user });
      setUser(result.user, result.token );
      console.log("Updated state:", useUser.getState());
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error in handleEditSubmit:", error);
      setMessage(error.message);
    }
  };
  
  

  return (
    <div className="profileView">
      {userData ? (
        <div className="profileContainer">
          <div className="profileImage">
            <img alt="Profile" />
            <p className="profileLocation">location</p>
          </div>
          <div className="profileUserData">
            {!isEditing ? (
              <>
                <h1>
                  {userData.user.firstName} {userData.user.lastName}
                </h1>
                <p>Email: {userData.user.email}</p>
                <p>Organisation: {userData.user.organisation}</p>
                <p>Role: {userData.user.role}</p>
                <div>
                  <button className="profileEditButton" onClick={() => setIsEditing(true)}>
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleEditSubmit}>
                <div>
                  <label>First Name:</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editData.firstName || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label>Last Name:</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editData.lastName || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label>Organisation:</label>
                  <input
                    type="text"
                    name="organisation"
                    value={editData.organisation || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label>Password (lämna tom för att behålla nuvarande):</label>
                  <input
                    type="password"
                    name="password"
                    value={editData.password || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {message && <p className="success-message">{message}</p>}

      <div className="profileDescription">
        Beskriv företaget
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis aliquam dolorem hic quod
          exercitationem id dolore? Ex, quas. In recusandae eveniet expedita molestiae, qui suscipit
          veritatis animi sit perspiciatis ducimus.
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
