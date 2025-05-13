import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../hooks/api/authApi";
import useUser from "../store/useUser";
import { User } from "../store/useUser";
import logo from '../assets/Värmland2.svg'
import { useModal } from "../components/modal/ModalContext"; 
import img from '../assets/login-logo.png'
import compare from "../assets/compare.png"

interface FormData {
  email: string;
  password: string;
  organisation: string;
  firstName: string;
  lastName: string;
  location: string;
}

const Login: React.FC = () => {
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
  const { showModal } = useModal(); 

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
      showModal(error.message || "An error occurred while logging in.", "error");
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await signupUser(formData);
      showModal("User created successfully!", "success");
      setTimeout(() => {
        setIsLogin(true);
      }, 1500);
    } catch (error: any) {
      showModal(error.message || "An error occurred while signing up.", "error");
    }
  };

  return (  
  <main className="grid grid-cols-1 lg:grid-cols-2 justify-center items-center h-screen w-full bg-[#ede0d4]">
    <img src={logo} alt="Logo" className="fixed top-4 left-4" />
    
    {/* Left Column - Login/Signup Form */}
    <div className="flex flex-col items-center justify-center bg-darkGreen text-white w-full h-full ">
      <h1 className="text-xl font-bold mb-4">{isLogin ? "Log In" : "Sign Up"}</h1>

      {isLogin ? (
        <form className="flex flex-col items-center w-full" onSubmit={handleLogin}>
          <div className="flex flex-col m-2 w-1/2">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              required
              placeholder="Enter your email"
              className="w-full h-10 border border-gray-300 rounded px-2 text-black"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col m-2 w-1/2">
            <label htmlFor="password">Lösenord:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password"
              className="w-full h-10 border border-gray-300 rounded px-2 text-black"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="bg-gray-800 text-white px-4 py-2 rounded-md mt-4"
          >
            Logga in
          </button>
        </form>
      ) : (
        <form className="flex flex-col items-center w-full" onSubmit={handleSignup}>
          {[
            { id: "email", label: "Email", placeholder: "Enter your email" },
            { id: "password", label: "Password", type: "password", placeholder: "Enter your password" },
            { id: "organisation", label: "Organisation", placeholder: "Enter your organisation" },
            { id: "firstName", label: "First Name", placeholder: "Enter your first name" },
            { id: "lastName", label: "Last Name", placeholder: "Enter your last name" },
            { id: "location", label: "Location", placeholder: "Enter your location" },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id} className="flex flex-col m-2 w-1/2">
              <label htmlFor={id}>{label}:</label>
              <input
                type={type || "text"}
                id={id}
                name={id}
                required
                placeholder={placeholder}
                className="w-full h-10 border border-gray-300 rounded px-2 text-black"
                value={(formData as any)[id]}
                onChange={handleChange}
              />
            </div>
          ))}

          <button
            type="submit"
            className="bg-gray-800 text-white mt-4 rounded-md px-4 py-2"
          >
            Registera dig
          </button>
        </form>
      )}

      {message && <p className="text-green-600 mt-2">{message}</p>}

      <div className="flex flex-row items-center mt-4">
        <p className="m-2">
          {isLogin ? "Don't have an account?" : "Already have an account?"}

        </p>
        <button
          onClick={toggleForm}
          className="underline"
        >
          {isLogin ? "Sign Up" : "Log In"}
        </button>
      </div>
    </div>

    {/* Right Column - img-text */}
    <div
    className="hidden lg:flex relative items-center justify-center p-6 h-full bg-cover bg-center"
    style={{
      backgroundImage: `url(${img})`
    }}
    

    // ----------------- //

      // className="hidden lg:flex relative items-center justify-center p-6 h-full bg-cover bg-center"
      // style={{
      //   backgroundImage:
      //     'url("https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
      // }}
    >

{/* // ----------------- // */}


      {/* Background Image Blur Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      <p className="text-center text-xl font-semibold text-white z-10 px-4 py-2 rounded-md">
      Tillsammans gör vi skillnad – behovsmatchning gör det enkelt att hitta rätt stöd vid rätt tid.
      </p>
      <div>
      <img src={compare} alt="" className="absolute bottom-6 right-6 z-20 w-40" />
      </div>
    </div>

  </main>
  );
};

export default Login;
