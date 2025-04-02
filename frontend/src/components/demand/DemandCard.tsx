import { useState } from "react";
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

const DemandCard = ({
  title,
  demand,
  category,
  author,
  demandId,
  className = "",
  isStackable = false,
  isOnTop = false,
  onSelect,
  headerExtras,
  belowHeader,
  initialExpanded = false,
  onEdit,
  onDelete,
}: DemandCardProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const { user } = useUser();
  const isMine = user?.email === author;

  const handleClick = () => {
    if (isStackable && onSelect) onSelect();
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  const wrapperClasses = [
    "relative flex flex-col w-full max-w-[900px] min-w-[250px] p-3 rounded-xl border border-black/10  bg-white transition-all duration-300",
    className,
    isStackable && "cursor-pointer",
    isOnTop ? "z-10" : "z-0",
    isMine ? "before:absolute before:inset-y-0 before:left-0 before:w-[6%] before:min-w-[2rem] before:rounded-l-xl before:bg-lightGreen" : 
             "before:absolute before:inset-y-0 before:left-0 before:w-[6%] before:min-w-[2rem] before:rounded-l-xl before:bg-blue-600",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses} onClick={handleClick}>
      <button
        onClick={toggleExpand}
        aria-label={isExpanded ? "Collapse" : "Expand"}
        title={isExpanded ? "Collapse" : "Expand"}
        className="absolute top-0 left-0 w-[6%] min-w-[2rem] h-full flex justify-center items-start pt-4 z-10 bg-transparent border-none"
      >
        <div
          className={`w-3 h-3 border-r-2 border-b-2 border-white transform transition-transform ${
            isExpanded ? "rotate-[225deg]" : "rotate-45"
          }`}
        />
      </button>

      <div className="flex justify-between items-center w-[90%] ml-12  border-green-700/50 rounded-t-xl">
        <div className="flex items-center">
          <h3 className="mx-4 my-2 text-xl font-semibold text-zinc-900 whitespace-nowrap">{title}</h3>
          <span className="bg-green-700/15 text-green-700 px-2 py-1 rounded text-sm font-semibold whitespace-nowrap">
            {category}
          </span>
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
              <DemandActionButtons onEdit={() => onEdit?.()} onDelete={() => onDelete?.(demandId)} />
            ) : (
              belowHeader
            )}
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
