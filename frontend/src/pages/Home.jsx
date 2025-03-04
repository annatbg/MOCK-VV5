import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../hooks/api/authApi";
import useUser from "../store/useUser";
import "./styles/Home.css";

function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    organisation: "",
    firstName: "",
    lastName: "",
    location: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useUser();

  const handleRedirect = (role) => {
    if (role == "admin") {
      navigate("/user/admin");
    } else if (role == "coach") {
      navigate("/user/coach");
    } else if (role == "developer") {
      navigate("/user/developer");
    } else {
      navigate("/user/client");
    }
  };

  const toggleForm = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await loginUser(formData.email, formData.password);
      console.log("result", result);
      login(result.user, result.token);
      handleRedirect(result.user.role);
    } catch (error) {
      alert(error.message || "An error occurred while logging in.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const result = await signupUser(formData);
      setMessage("User created!");
    } catch (error) {
      alert(error.message || "An error occurred while signing up.");
    }
  };

  return (
    <div className="home-container">
      <h1>{isLogin ? "Login" : "Signup"}</h1>
      {isLogin ? (
        <form onSubmit={handleLogin}>
          <div className="home-form-group">
            <label htmlFor="email">email:</label>
            <br />
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
            <br />
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
          <button type="submit" className="submit-button">
            Login
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup}>
          <div className="home-form-group">
            <label htmlFor="email">email:</label>
            <br />
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
            <br />
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
            <br />
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
            <br />
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
            <br />
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
            <br />
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
          <button type="submit" className="submit-button">
            Signup
          </button>
        </form>
      )}
      {message && <p className="home-success-message">{message}</p>}
      <p className="toggle-message">
        {isLogin ? "Don't have an account?" : "Already have an account?"} <br />
        <button onClick={toggleForm} className="toggle-button">
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}

export default Home;
