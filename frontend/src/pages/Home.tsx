import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../hooks/api/authApi";
import useUser from "../store/useUser";
import { User } from "../store/useUser";

interface FormData {
  email: string;
  password: string;
  organisation: string;
  firstName: string;
  lastName: string;
  location: string;
}

const Home: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    organisation: "",
    firstName: "",
    lastName: "",
    location: "",
  });
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useUser();

  const handleRedirect = (role: string): void => {
    if (role === "admin") navigate("/user/admin");
    else if (role === "coach") navigate("/user/coach");
    else if (role === "developer") navigate("/user/developer");
    else navigate("/user/client");
  };

  const toggleForm = (): void => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      organisation: "",
      firstName: "",
      lastName: "",
      location: "",
    });
    setMessage("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const result = await loginUser(formData.email, formData.password);
      const { role, ...rest } = result.user;
      const fixedRole: string =
        typeof role === "function" ? (role as (arg: any) => string)("") : role;
      const userData: User = { ...rest, role: fixedRole };
      login(userData, result.token);
      handleRedirect(fixedRole);
    } catch (error: any) {
      alert(error.message || "An error occurred while logging in.");
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await signupUser(formData);
      setMessage("User created!");
    } catch (error: any) {
      alert(error.message || "An error occurred while signing up.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-[15%] h-full w-full">
      <h1 className="text-xl font-bold mb-4">{isLogin ? "Login" : "Signup"}</h1>
      {isLogin ? (
        <form className="flex flex-col items-center" onSubmit={handleLogin}>
          <div className="flex flex-col m-2">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              required
              className="w-full h-6 border border-gray-300 rounded"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col m-2">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full h-6 border border-gray-300 rounded"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="bg-gray-800 text-white mt-2 rounded px-3 py-1 w-[75px] h-[25px]"
          >
            Login
          </button>
        </form>
      ) : (
        <form className="flex flex-col items-center justify-center" onSubmit={handleSignup}>
          {[
            { id: "email", label: "Email" },
            { id: "password", label: "Password", type: "password" },
            { id: "organisation", label: "Organisation" },
            { id: "firstName", label: "First Name" },
            { id: "lastName", label: "Last Name" },
            { id: "location", label: "Location" },
          ].map(({ id, label, type }) => (
            <div key={id} className="flex flex-col m-2">
              <label htmlFor={id}>{label}:</label>
              <input
                type={type || "text"}
                id={id}
                name={id}
                required
                className="w-full h-6 border border-gray-300 rounded"
                value={(formData as any)[id]}
                onChange={handleChange}
              />
            </div>
          ))}
          <button
            type="submit"
            className="bg-gray-800 text-white mt-2 rounded px-3 py-1 w-[75px] h-[25px]"
          >
            Signup
          </button>
        </form>
      )}
      {message && <p className="text-green-600 mt-2">{message}</p>}
      <div className="flex flex-col items-center mt-4">
        <p className="m-2">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </p>
        <button
          onClick={toggleForm}
          className="bg-gray-800 text-white mt-2 rounded px-3 py-1 w-[75px] h-[25px]"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </div>
    </div>
  );
};

export default Home;
