import { useState } from "react";
import { createDemand } from "../../../hooks/api/demandApi";
import useUser from "../../../store/useUser";
import { useModal } from "../../../components/modal/ModalContext";
import Button from "../../button/Button";
import { motion } from "framer-motion";

interface FormData {
  title: string;
  demand: string;
  category: string;
}

interface CreateDemandProps {
  onClose?: () => void;
}

const CreateDemand = ({ onClose }: CreateDemandProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    demand: "",
    category: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const user = useUser((state) => state.user);
  const { showModal } = useModal();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { title, demand, category } = formData;

    if (!title.trim() || !demand.trim() || !category.trim()) {
      showModal("Alla fält måste fyllas i.", "error");
      return;
    }

    if (!user) {
      showModal("Användare saknas. Logga in igen.", "error");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await createDemand({ formData });
      setFormData({ title: "", demand: "", category: "" });
      showModal("Behov skapat!", "success");
      onClose?.();
    } catch (err: any) {
      showModal(err?.message || "Något gick fel.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-md p-6 w-full border border-slate-200"
    >
      <h1 className="text-3xl pb-6">Skapa ett nytt behov</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full ">
        <div>
          <label
            htmlFor="title"
            className="block font-semibold text-gray-800 mb-1"
          >
            Rubrik
          </label>
          <textarea
            id="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Skriv en rubrik"
            className="w-full p-3 border rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-100"
            disabled={loading}
            rows={2}
          />
        </div>

        <div>
          <label
            htmlFor="demand"
            className="block font-semibold text-gray-800 mb-1"
          >
            Behov
          </label>
          <textarea
            id="demand"
            value={formData.demand}
            onChange={handleChange}
            placeholder="Beskriv ditt behov..."
            className="w-full p-3 border rounded-xl text-base h-32 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-100"
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block font-semibold text-gray-800 mb-1"
          >
            Kategori
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl text-base bg-white focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-100"
            disabled={loading}
          >
            <option value="">Välj en kategori</option>
            <option value="Hälsa">Hälsa</option>
            <option value="Teknologi">Teknologi</option>
            <option value="Ekonomi">Ekonomi</option>
            <option value="Miljö">Miljö</option>
            <option value="Utbildning">Utbildning</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {successMessage && (
          <p className="text-green-600 text-sm text-center">{successMessage}</p>
        )}

        <div className="flex justify-end gap-3 mt-4">
          {onClose && (
            <Button
              onClick={onClose}
              label="Avbryt"
              variant="secondary"
              className="p-2"
              disabled={loading}
            />
          )}
          <Button
            label={loading ? "Skickar..." : "Skapa behov"}
            variant="primary"
            className="p-2"
            disabled={loading}
            type="submit" // This ensures the form is submitted when clicked
          />
        </div>
      </form>
    </motion.div>
  );
};

export default CreateDemand;
