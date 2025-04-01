import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../hooks/api/authApi";
import useUser from "../store/useUser";
import "./styles/Home.css";
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
    if (role === "admin") {
      navigate("/user/admin");
    } else if (role === "coach") {
      navigate("/user/coach");
    } else if (role === "developer") {
      navigate("/user/developer");
    } else {
      navigate("/user/client");
    }
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
      console.log("result", result);
      

      const { role, ...rest } = result.user;
      const fixedRole: string =
        typeof role === "function" ? (role as (arg: any) => string)("") : role;
      

      const userData: User = {
        ...rest,
        role: fixedRole,
      };

      login(userData, result.token);
      handleRedirect(fixedRole);
    } catch (error: any) {
      alert(error.message || "An error occurred while logging in.");
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const result = await signupUser(formData);
      setMessage("User created!");
    } catch (error: any) {
      alert(error.message || "An error occurred while signing up.");
    }
  };

  return (
    <div className="home-container">
      <h1>{isLogin ? "Login" : "Signup"}</h1>
      {isLogin ? (
        <form className="home-form-container" onSubmit={handleLogin}>
          <div className="home-form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              required
              className="input-field"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="home-form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="input-field"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="home-button">
            Login
          </button>
        </form>
      ) : (
        <form className="home-create-container" onSubmit={handleSignup}>
          <div className="home-form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              required
              className="input-field"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="home-form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="input-field"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="home-form-group">
            <label htmlFor="organisation">Organisation:</label>
            <input
              type="text"
              id="organisation"
              name="organisation"
              required
              className="input-field"
              value={formData.organisation}
              onChange={handleChange}
            />
          </div>
          <div className="home-form-group">
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="input-field"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="home-form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              className="input-field"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="home-form-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              required
              className="input-field"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="home-button">
            Signup
          </button>
        </form>
      )}
      {message && <p className="home-success-message">{message}</p>}
      <div className="home-signup-button-container">
        <p className="account-message">
          {isLogin ? "Don't have an account?" : "Already have an account?"} <br />
        </p>
        <button onClick={toggleForm} className="home-button">
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </div>
    </div>
  );
};

export default Home;
