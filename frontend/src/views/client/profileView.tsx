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

  return (
    <div className="flex flex-col items-center p-6 w-full ">
      {userData ? (
        <div className="flex flex-col md:flex-row w-full bg-[whitesmoke] rounded-lg p-6 mb-6">
          <div className="ml-6 mt-6 text-center">
            <div className="w-[140px] h-[140px] rounded-full border-2 border-black flex items-center justify-center text-4xl font-bold mb-2">
              {userData.user.firstName?.charAt(0).toUpperCase()}
              {userData.user.lastName?.charAt(0).toUpperCase()}
            </div>
            <p className="capitalize">{userData.user.location}</p>
          </div>

          <div className="pl-16 mt-6 w-full">
            {!isEditing ? (
              <>
                <h1 className="text-2xl font-semibold capitalize mb-2">
                  {userData.user.firstName} {userData.user.lastName}
                </h1>
                <p className="capitalize">Email: {userData.user.email}</p>
                <p className="capitalize">Organisation: {userData.user.organisation}</p>
                <p className="capitalize">Role: {userData.user.role}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
                >
                  Edit
                </button>
              </>
            ) : (
              <form onSubmit={handleEditSubmit} className="flex flex-col text-lg gap-3">
                {[
                  { label: "First Name", name: "firstName", type: "text" },
                  { label: "Last Name", name: "lastName", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Organisation", name: "organisation", type: "text" },
                  { label: "Location", name: "location", type: "text" },
                  { label: "Password", name: "password", type: "password" },
                ].map(({ label, name, type }) => (
                  <div key={name}>
                    <label className="block mb-1">{label}:</label>
                    <input
                      type={type}
                      name={name}
                      value={(editData as any)[name] || ""}
                      onChange={handleEditChange}
                      required={name !== "password"}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                ))}
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-800 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {message && <p className="text-green-600 mb-4">{message}</p>}

      <div className="flex flex-col items-center bg-[whitesmoke] rounded-lg p-6 w-full">
        <h2 className="text-lg font-semibold mb-2">Beskriv företaget</h2>
        <p className="text-center">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis aliquam dolorem hic quod
          exercitationem id dolore? Ex, quas. In recusandae eveniet expedita molestiae, qui suscipit
          veritatis animi sit perspiciatis ducimus.
        </p>
      </div>
    </div>
  );
};

export default ProfileView;
