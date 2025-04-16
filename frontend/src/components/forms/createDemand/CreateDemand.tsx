import { useState } from "react";
import { createDemand } from "../../../hooks/api/demandApi";
import useUser from "../../../store/useUser";

import Button from "../../button/Button";  
import { motion } from "framer-motion";


interface FormData {
  title: string;
  demand: string;
  category: string;
}

const CreateDemand = () => {
  const [formData, setFormData] = useState<FormData>({ title: "", demand: "", category: "" });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const user = useUser((state) => state.user);
  const { showModal } = useModal();  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { title, demand, category } = formData;

    if (!title.trim() || !demand.trim() || !category.trim()) {
      setSuccessMessage(null);
      showModal("All fields are required.", "error");  
      return;
    }

    if (!user) {
      setSuccessMessage(null);
      showModal("User not found. Please log in.", "error");  
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await createDemand({ formData });
      setFormData({ title: "", demand: "", category: "" });
      showModal("Demand created successfully!", "success");  
    } catch (err: any) {
      showModal(err?.message || "An error occurred while creating the demand.", "error");  
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen); 
  };

  return (
    <div className="flex flex-col w-full">
      {/* Use the Button component to toggle form visibility */}



        <Button 
        onClick={toggleForm} 
        label={isFormOpen ? "Close form" : "Create demand"} 
        variant={isFormOpen ? "danger" : "primary"} 
        className={isFormOpen ? "w-24 h-16" : "w-32 h-16 "} 
        
      />

      

      {/* Conditionally render the form */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}  // Start above and hidden
        animate={{ opacity: isFormOpen ? 1 : 0, y: isFormOpen ? 0 : -50 }}  // Slide in when open
        transition={{ duration: 0.5 }} // Smooth transition duration
        className="flex flex-col gap-2 w-[95%] max-w-lg mt-4"
      >
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-[95%] max-w-lg mt-4">
          <label htmlFor="title" className="font-bold text-lg">Rubrik:</label>
          <textarea
            id="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Skriv en rubrik"
            className="p-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
            disabled={loading}
          />

          <label htmlFor="demand" className="font-bold text-lg">Behov:</label>
          <textarea
            id="demand"
            value={formData.demand}
            onChange={handleChange}
            placeholder="Beskriv ditt behov..."
            className="p-2 border border-gray-300 rounded-md text-lg h-28 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
            disabled={loading}
          />

          <label htmlFor="category" className="font-bold text-lg">Kategori:</label>
          <select
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
            disabled={loading}
          >
            <option value="">Välj en Kategori</option>
            <option value="Health">Health</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Environment">Environment</option>
            <option value="Education">Education</option>
          </select>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}

          <div className="flex justify-center mt-2">
            <button
              type="submit"
              className="bg-gray-800 text-white text-lg px-6 py-2 rounded-md transition hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Skapa behov"}
            </button>
          </div>
        </form>
      )}
            </motion.div>
    </div>
  );
};

export default CreateDemand;
