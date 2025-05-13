import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import useUser from "../../store/useUser";
import { fetchUserData, updateUser } from "../../hooks/api/userApi";
import { useModal } from "../../components/modal/ModalContext";

const ProfileView: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);

  const setUser = useUser((state) => state.login);
  const { showModal } = useModal();

  // Hämta profil
  const fetchUserProfile = async () => {
    try {
      const res = await fetchUserData();
      setUserData(res.user);
      setEditData(res.user);
    } catch (err) {
      console.error("Fel vid hämtning av användare:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Spara ändringar
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { firstName, lastName, email, organisation, location } = editData;
    if (!firstName || !lastName || !email || !organisation || !location) {
      showModal("Fyll i alla fält", "error");
      return;
    }

    try {
      const result = await updateUser(editData);
      setUserData(result.user);
      setUser(
        { email: result.user.email, role: result.user.role },
        result.token
      );
      showModal("Profil uppdaterad", "success");
      setIsEditing(false);
    } catch (error: any) {
      showModal(error.message, "error");
    }
  };

  const renderProfileInfo = () => (
    <div className="w-full">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold">
          {userData.firstName} {userData.lastName}
        </h1>
      </div>
      <div className="space-y-2">
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Organisation:</strong> {userData.organisation}
        </p>
        <p>
          <strong>Plats:</strong> {userData.location}
        </p>
        <p>
          <strong>Roll:</strong> {userData.role}
        </p>
      </div>
      <div className="text-center mt-6">
        <button onClick={() => setIsEditing(true)} className="btn">
          Redigera
        </button>
      </div>
    </div>
  );

  const renderEditForm = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {[
        "firstName",
        "lastName",
        "email",
        "organisation",
        "location",
        "password",
      ].map((field) => (
        <div key={field}>
          <label>{field}:</label>
          <input
            type={field === "password" ? "password" : "text"}
            name={field}
            value={editData[field] || ""}
            onChange={handleChange}
            required={field !== "password"}
            className="input"
          />
        </div>
      ))}
      <div className="flex gap-4 justify-end">
        <button type="submit" className="btn">
          Spara
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="btn-secondary"
        >
          Avbryt
        </button>
      </div>
    </form>
  );

  if (!userData) return <p>Laddar profil...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-lightGreen text-lightText rounded-xl shadow-md">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-lightText text-lightGreen flex items-center justify-center rounded-full text-3xl font-bold">
          {userData.firstName?.[0]}
          {userData.lastName?.[0]}
        </div>
      </div>
      {isEditing ? renderEditForm() : renderProfileInfo()}
    </div>
  );
};

export default ProfileView;
