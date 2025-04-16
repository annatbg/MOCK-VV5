import { useState } from "react";
import MyDemands from "../list/MyDemands";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState<"demand" | "match">("demand");

  return (
    <div className="w-full">
      {/* Tabs + Create Demand button */}
      <div className="flex items-center justify-between border-b border-slate-300 mb-4">
        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("demand")}
            className={`py-2 px-4 ${
              activeTab === "demand"
                ? "border-b-2 border-green-500 text-green-700"
                : "text-gray-500"
            } transition-all duration-200`}
          >
            Demand List
          </button>

          <button
            onClick={() => setActiveTab("match")}
            className={`py-2 px-4 ${
              activeTab === "match"
                ? "border-b-2 border-green-500 text-green-700"
                : "text-gray-500"
            } transition-all duration-200`}
          >
            Match List
          </button>
        </div>

        {/* Create Demand Button */}
        <button
          className="bg-darkGreen text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          onClick={() => console.log("Create Demand")}
        >
          Create Demand
        </button>
      </div>

      <div>
        {activeTab === "demand" && (
          <div>
            <MyDemands />
          </div>
        )}

        {activeTab === "match" && (
          <div>
            <p>Här är din Match List 🔎</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;
