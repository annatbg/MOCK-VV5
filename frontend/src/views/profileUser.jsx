import React, { useEffect, useState } from "react";
import useUser from "../store/useUser";
import { fetchUserData } from "../hooks/api/userApi";
import "./styles/ProfileUser.css";
const API_URL = import.meta.env.VITE_API_URL;

const ProfileUser = () => {
  const [userData, setUserData] = useState(null);
  const user = useUser((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserData(user, API_URL + "/user/fetch");
        console.log("Fetched user data:", data);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching data in ProfileUser:", error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="profileView">
      {userData ? (
        <div className="profileContainer">
          <div className="profileImage">
          <img></img>
          <p className="profileLocation">location</p>
          </div>
          <div className="profileUserData">
          <h1>{userData.user.firstName} {userData.user.lastName}</h1>
          <p>Email: {userData.user.email}</p>
          <p>Organisation: {userData.user.organisation}</p>
          <p>Role: {userData.user.role}</p>
          <div>
            <button className="profileEditButton">Edit</button>
          </div>
          </div>


        </div>
      ) : (
        <p>Loading...</p>
      )}

      <div className="profileDescription">Beskriv företagaet
      <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis aliquam dolorem hic quod exercitationem id dolore? Ex, quas. In recusandae eveniet expedita molestiae, qui suscipit veritatis animi sit perspiciatis ducimus.</div>

      </div>
    </div>
  );
};

export default ProfileUser;
