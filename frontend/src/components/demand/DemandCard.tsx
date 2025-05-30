import { useState } from "react";
import useUser from "../../store/useUser";
import DemandActionButtons from "./DemandActionButtons";
import { ChevronUp, ChevronDown } from "lucide-react";
import { editDemand as updateDemand } from "../../hooks/api/demandApi";

interface DemandCardProps {
  title: string;
  demand: string;
  category: string;
  author: string;
  demandId?: string;
  className?: string;
  headerExtras?: React.ReactNode;
  belowHeader?: React.ReactNode;
  initialExpanded?: boolean;
  onDelete?: (demandId?: string) => void;
}

const DemandCard = ({
  title,
  demand,
  category,
  author,
  demandId,
  className = "",
  headerExtras,
  belowHeader,
  initialExpanded = false,
  onDelete,
}: DemandCardProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDemand, setEditDemand] = useState(demand);
  const { user } = useUser();
  const isMine = user?.email === author;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleSave = async () => {
    if (!demandId) return;
    try {
      const updated = await updateDemand(demandId, {
        title: editTitle,
        demand: editDemand,
        category,
      });

      setEditTitle(updated.title);
      setEditDemand(updated.demand);
      setIsEditing(false);

    } catch (error) {
      alert("Kunde inte uppdatera behovet.");
      console.error(error);
    }
  };


  const colorClass = isMine ? "bg-lightGreen" : "bg-blue-500";

  return (
    <div
      className={`relative flex flex-col w-full max-w-[full] min-w-[250px] py-3 rounded-md border border-slate-100 bg-white transition-all overflow-hidden duration-300 ${className}`}
    >
      <button
        onClick={toggleExpand}
        aria-label={isExpanded ? "Collapse" : "Expand"}
        title={isExpanded ? "Collapse" : "Expand"}
        className={`absolute top-0 left-0 w-12 h-full py-5 flex justify-center z-10 rounded-md rounded-r-none ${colorClass}`}
      >
        {isExpanded ? (
          <ChevronUp size={30} className="text-white" />
        ) : (
          <ChevronDown size={30} className="text-white" />
        )}
      </button>

      <div className="pl-10 pr-4">
        <div className="flex justify-between items-center rounded-t-xl">
          <div className="flex items-center">
            {isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mx-4 my-2 text-xl font-semibold text-zinc-900 border rounded px-2 py-1"
              />
            ) : (
              <h3 className="mx-4 my-2 text-xl font-semibold text-zinc-900 whitespace-nowrap">
                {title}
              </h3>
            )}
            <span className="ml-2 rounded-md px-1 bg-green-100 text-green-700 text-sm font-semibold whitespace-nowrap">
              {category}
            </span>
          </div>
          {headerExtras}
        </div>

        {isExpanded && (
          <>
            <div className="ml-4 p-2 border border-dashed border-green-700/30 rounded-md min-h-[100px] max-h-[300px] overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={editDemand}
                  onChange={(e) => setEditDemand(e.target.value)}
                  className="w-full min-h-[100px] border rounded p-2 text-sm text-zinc-800"
                />
              ) : (
                <p className="text-sm text-zinc-800">{demand}</p>
              )}
            </div>

            <div className="flex justify-end w-full my-2">
              {isMine && !isEditing && (
                <DemandActionButtons
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => onDelete?.(demandId)}
                />
              )}

              {isMine && isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 rounded bg-green-700 text-white font-semibold text-sm"
                  >
                    Spara
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(title);
                      setEditDemand(demand);
                    }}
                    className="px-3 py-1.5 rounded bg-gray-400 text-white font-semibold text-sm"
                  >
                    Avbryt
                  </button>
                </div>
              )}

              {!isMine && belowHeader}
            </div>


            <div className="flex w-full mt-auto">
              <p className="ml-auto pt-2 text-sm text-zinc-500 border-t border-dashed border-green-700/50 whitespace-nowrap">
                Skapad av: {author}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DemandCard;
