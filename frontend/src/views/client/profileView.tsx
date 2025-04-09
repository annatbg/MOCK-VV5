import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import useUser, { User as StoreUser } from "../../store/useUser";
import { fetchUserData, updateUser } from "../../hooks/api/userApi";

const API_URL = import.meta.env.VITE_API_URL as string;

interface ProfileData {
  user: StoreUser;
}

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
      if (!user) return;
      try {
        const data = (await fetchUserData(user, `${API_URL}/user/fetch`)) as unknown as ProfileData;
        setUserData(data);

        const { password, ...userWithoutPassword } = data.user;
        setEditData(userWithoutPassword);

      } catch (error) {
        console.error("Error fetching data in ProfileView:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = (await updateUser(editData)) as unknown as UpdateUserResponse;
      setUserData({ user: result.user });
      setUser(result.user, result.token);
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  };

  return (
<div className="grid grid-cols-1 place-items-center p-10 w-full -mt-4 pt-1">
  {userData ? (
    <div className="w-full max-w-lg bg-lightGreen text-lightText rounded-xl p-6 shadow-lg grid grid-cols-1 gap-6">
      {/* Profilbild */}
      <div className="w-28 h-28 rounded-full border-4 border-lightText bg-lightText text-lightGreen flex items-center justify-center text-3xl font-bold mb-6 justify-self-center">
        {userData.user.firstName?.charAt(0).toUpperCase()}
        {userData.user.lastName?.charAt(0).toUpperCase()}
      </div>

      {/* Profilinformation */}
      {!isEditing ? (
        <div className="w-full">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold mb-2">
              {capitalizeFirstLetter(userData.user.firstName || '')}{" "}
              {capitalizeFirstLetter(userData.user.lastName || '')}
            </h1>
            <p className="text-lg">Email: {capitalizeFirstLetter(userData.user.email || '')}</p>
            <p className="text-lg">Organisation: {capitalizeFirstLetter(userData.user.organisation || '')}</p>
            <p className="text-lg">Plats: {capitalizeFirstLetter(userData.user.location || '')}</p>
            <p className="text-lg">Roll: {capitalizeFirstLetter(userData.user.role || '')}</p>
          </div>

          {/* Edit-knapp */}
          <div className="w-full flex justify-end mt-8">
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-3 bg-lightText text-lightGreen font-semibold rounded-md hover:bg-darkGreen hover:text-lightText transition-all ease-in-out duration-200"
            >
              Edit
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-1 w-full mt-4">
          {[
            { label: "Förnamn", name: "firstName", type: "text" },
            { label: "Efternamn", name: "lastName", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Organisation", name: "organisation", type: "text" },
            { label: "Plats", name: "location", type: "text" },
            { label: "Lösenord", name: "password", type: "password" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-sm mb-2">{label}</label>
              <input
                type={type}
                name={name}
                value={(editData as any)[name] || ""}
                onChange={handleEditChange}
                required={name !== "password"}
                className="w-full border-2 border-gray-300 rounded-md px-4 py-3 text-darkText focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all ease-in-out duration-200"
              />
            </div>
          ))}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="submit"
              className="bg-lightText text-lightGreen px-5 py-3 rounded-md hover:bg-darkGreen hover:text-lightText transition-all ease-in-out duration-200"
            >
              Spara
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-lightText text-lightGreen px-5 py-3 rounded-md hover:bg-darkGreen hover:text-lightText transition-all ease-in-out duration-200"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}
    </div>
  ) : (
    <p className="text-darkText">Laddar...</p>
  )}

  {message && <p className="text-green-500 mt-4 font-medium">{message}</p>}
</div>



  );
;}  

export default ProfileView;
