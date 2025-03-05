import React, { useState } from "react";
import { createDemand } from "../../../hooks/api/demandApi";
import useUser from "../../../store/useUser";
import "./CreateDemand.css";

const CreateDemand = () => {
  const [formData, setFormData] = useState({
    title: "",
    demand: "",
    category: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const user = useUser((state) => state.user);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.demand.trim() ||
      !formData.category.trim()
    ) {
      setError("All fields are required.");
      setSuccessMessage(null);
      return;
    }

    if (!user) {
      setError("User not found. Please log in.");
      setSuccessMessage(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await createDemand({ formData });
      setFormData({ title: "", demand: "", category: "" });
      setSuccessMessage("Demand created successfully!");
    } catch (error) {
      setError(error.message || "An error occurred while creating the demand.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3
        className="demandForm-heading"
        onClick={() => setIsFormOpen(!isFormOpen)}
      >
        Skapa nytt behov
        <span className="demandForm-arrow">{isFormOpen ? "▲" : "▼"}</span>
      </h3>

      <div className="demandForm-container">
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="demandForm-form">
          <label htmlFor="title" className="demandForm-label">
            Rubrik:
          </label>
          <textarea
            type="text"
            id="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Skriv en rubrik"
            className="demandForm-input"
            disabled={loading}
          />

          <label htmlFor="demand" className="demandForm-label">
            Behov:
          </label>
          <textarea
            type="text"
            id="demand"
            value={formData.demand}
            onChange={handleChange}
            placeholder="Beskriv ditt behov..."
            className="demandForm-input-behov"
            disabled={loading}
          />

          <label htmlFor="category" className="demandForm-label">
            Kategori:
          </label>
         
          <select
            type="text"
            id="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Vilken kategori tillhör ditt behov"
            className="demandForm-input"
            disabled={loading}
          >
            <option value="">Välj en Kategori</option>
            <option value="Health">Health</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Environment">Environment</option>
            <option value="Education">Education</option>
          </select>

          {error && <p className="demandForm-error">{error}</p>}
          {successMessage && (
            <p className="demandForm-success">{successMessage}</p>
          )}

          
        <div className="demandForm-button-container">
          <button
            type="submit"
            className="demandForm-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Skapa behov"}
          </button>
          </div>
          
        </form>
      )}    
      </div>
    </>
  );
};

export default CreateDemand;
