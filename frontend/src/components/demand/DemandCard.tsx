import React, { useState } from "react";
import useUser from "../../store/useUser";
import DemandActionButtons from "./DemandActionButtons";

interface DemandCardProps {
  title: string;
  demand: string;
  category: string;
  author: string;
  demandId?: string;
  className?: string;
  isStackable?: boolean;
  isOnTop?: boolean;
  onSelect?: () => void;
  headerExtras?: React.ReactNode;
  belowHeader?: React.ReactNode;
  initialExpanded?: boolean;
  onEdit?: () => void;
  onDelete?: (demandId?: string) => void;
}

const DemandCard: React.FC<DemandCardProps> = ({
  title,
  demand,
  category,
  author,
  demandId,
  className,
  isStackable = false,
  isOnTop = false,
  onSelect = () => {},
  headerExtras,
  belowHeader,
  initialExpanded = false,
  onEdit = () => {},
  onDelete = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const { user } = useUser();
  const isMine = user?.email === author;

  const handleClick = () => {
    if (isStackable) onSelect();
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(demandId);
  };

  const demandColor = isMine ?
    "before:bg-gradient-to-b before:from-green-700 before:to-green-900 after:bg-gradient-to-b after:from-yellow-100 after:to-yellow-800" :
    "before:bg-gradient-to-b before:from-blue-900 before:to-blue-800 after:bg-gradient-to-b after:from-blue-200 after:to-blue-950";

  return (
    <div
      className={`relative flex flex-col w-full max-w-[900px] min-w-[250px] p-3 rounded-xl bg-gradient-to-br from-white to-zinc-100 border border-black/10 shadow-md transition-all duration-300 ease-in-out ${className} ${isStackable ? "cursor-pointer" : ""} ${isOnTop ? "z-10" : "z-0"} ${isExpanded ? "translate-y-[-3%] shadow-lg" : "hover:translate-y-[-1%] hover:shadow-md"} ${isMine ? "before:absolute before:top-[-1px] before:left-[-1px] before:w-[6%] before:min-w-[2rem] before:h-[calc(100%+2px)] before:rounded-l-xl after:absolute after:top-[-1px] after:left-[-2px] after:w-[calc(6%+1px)] after:min-w-[2rem] after:h-[calc(100%+2px)] after:rounded-l-xl after:z-[-1]" : ""} ${demandColor}`}
      onClick={handleClick}
    >
      <button
        onClick={toggleExpand}
        aria-label={isExpanded ? "Collapse" : "Expand"}
        title={isExpanded ? "Collapse" : "Expand"}
        className="absolute top-0 left-0 w-[6%] min-w-[2rem] h-full flex justify-center items-start pt-4 z-10 bg-transparent border-none"
      >
        <div className={`w-3 h-3 border-r-2 border-b-2 border-white transform transition-transform ${isExpanded ? "rotate-[225deg]" : "rotate-45"}`} />
      </button>

      <div className="flex justify-between items-center w-[90%] ml-12 border-b border-dashed border-green-700/50 rounded-t-xl">
        <div className="flex items-center">
          <h3 className="mx-4 my-2 text-xl font-semibold text-zinc-900 whitespace-nowrap">{title}</h3>
          <span className="bg-green-700/15 text-green-700 px-2 py-1 rounded text-sm font-semibold whitespace-nowrap">{category}</span>
        </div>
        {headerExtras}
      </div>

      {isExpanded && (
        <>
          <div className="p-2 border border-dashed border-green-700/30 rounded-lg m-2 ml-[8%] w-[80%] min-h-[100px] max-h-[300px] overflow-y-auto">
            <p className="text-sm text-zinc-800">{demand}</p>
          </div>

          <div className="flex justify-end w-full my-2">
            {isMine ? (
              <DemandActionButtons onEdit={() => onEdit()} onDelete={() => onDelete(demandId)} />
            ) : belowHeader}
          </div>

          <div className="flex w-full mt-auto">
            <p className="ml-auto pt-2 text-sm text-zinc-500 border-t border-dashed border-green-700/50 whitespace-nowrap">
              Skapad av: {author}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DemandCard;