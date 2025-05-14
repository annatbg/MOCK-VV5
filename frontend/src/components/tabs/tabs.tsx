import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MyDemands from "../list/MyDemands";
import Button from "../button/Button";
import AcceptedDemands from "../list/AcceptedDemands";

interface TabsProps {
  onToggleCreate: () => void;
}

const Tabs = ({ onToggleCreate }: TabsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get("tab") === "match" ? "match" : "demand";

  const [activeTab, setActiveTab] = useState<"demand" | "match">(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: "demand" | "match") => {
    setActiveTab(tab);
    searchParams.set("tab", tab);
    setSearchParams(searchParams); 
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <Button

            onClick={() => handleTabChange("demand")}
            label="Behovs Lista"

            variant={activeTab === "demand" ? "primary" : "secondary"}
            className="py-2 px-4"
          />

          <Button
            onClick={() => handleTabChange("match")}
            label="Match Lista"
            variant={activeTab === "match" ? "primary" : "secondary"}
            className="py-2 px-4"
          />
        </div>

        <Button
          onClick={onToggleCreate}
          label="Skapa Behov"
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
