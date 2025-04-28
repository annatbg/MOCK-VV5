import { useState } from "react";
import MyDemands from "../list/MyDemands";
import Button from "../button/Button";
import AcceptedDemands from "../list/AcceptedDemands";

interface TabsProps {
  onToggleCreate: () => void;
}

const Tabs = ({ onToggleCreate }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<"demand" | "match">("demand");

  return (
    <div className="w-full">
      <div className="flex items-center justify-between border-b border-slate-300 mb-4">
        <div className="flex gap-4">
          <Button
            onClick={() => setActiveTab("demand")}
            label="Demand Lista"
            variant={activeTab === "demand" ? "primary" : "secondary"}
            className="py-2 px-4"
          />

          <Button
            onClick={() => setActiveTab("match")}
            label="Match Lista"
            variant={activeTab === "match" ? "primary" : "secondary"}
            className="py-2 px-4"
          />
        </div>

        <Button
          onClick={onToggleCreate}
          label="Ny demand"
          variant="primary"
          className="p-2"
        />
      </div>

      <div>
        {activeTab === "demand" && <MyDemands />}
        {activeTab === "match" && <AcceptedDemands />}
      </div>
    </div>
  );
};

export default Tabs;
