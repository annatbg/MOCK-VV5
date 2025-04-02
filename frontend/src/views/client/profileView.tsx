import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import useUser, { User as StoreUser } from "../../store/useUser";
import { fetchUserData, updateUser } from "../../hooks/api/userApi";
import "./styles/ProfileView.css";

const API_URL = import.meta.env.VITE_API_URL as string;

// API response from fetchUserData is expected to have a user property.
interface ProfileData {
  user: StoreUser;
}

// API response from updateUser is expected to have both user and token.
interface UpdateUserResponse {
  user: StoreUser;
  token: string;
}

const ProfileView: React.FC = () => {
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<Partial<StoreUser>>({});
  const [message, setMessage] = useState<string>("");

  const user = useUser((state) => state.user);
  const setUser = useUser((state) => state.login);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        const data = (await fetchUserData(user, `${API_URL}/user/fetch`)) as unknown as ProfileData;
        console.log("Fetched user data:", data);
        setUserData(data);
        setEditData(data.user);
      } catch (error) {
        console.error("Error fetching data in ProfileView:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("editData before update:", editData);
    try {
      const result = (await updateUser(editData)) as unknown as UpdateUserResponse;
      console.log("Profile updated result:", result);
      setUserData({ user: result.user });
      setUser(result.user, result.token);
      console.log("Updated state:", useUser.getState());
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error in handleEditSubmit:", error);
      setMessage(error.message);
    }
  };

  return (
    <div className="profileView">
      {userData ? (
        <div className="profileContainer">
          <div className="proflieImageContainer">
            <div className="profileImage">
              <h2 className="profileImagesUsername">
                {userData.user.firstName?.charAt(0).toUpperCase()}
                {userData.user.lastName?.charAt(0).toUpperCase()}
              </h2>
            </div>
            <p className="profileLocation">{userData.user.location}</p>
          </div>
          <div className="profileUserData">
            {!isEditing ? (
              <>
                <h1 className="profileUsername">
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
                  <label>First Name: </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editData.firstName || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label>Last Name: </label>
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
                  <label>Location:</label>
                  <input
                    type="text"
                    name="location"
                    value={editData.location || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <label>Password:</label>
                  <input
                    type="password"
                    name="password"
                    value={editData.password || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <button className="profileButton" type="submit">
                  Save
                </button>
                <button className="profileButton" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {message && <p className="successMessage">{message}</p>}

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
