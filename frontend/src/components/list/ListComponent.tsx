import { useState, useEffect } from "react";
import { useModal } from "../../components/modal/ModalContext"; 

type ListComponentProps<T> = {
  fetchFunction: () => Promise<{ data: T[] }>;
  title: string;
  renderItem: (item: T) => React.ReactNode;
};

const ListComponent = <T,>({ fetchFunction, title, renderItem }: ListComponentProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { showModal } = useModal();

  useEffect(() => {
    const getItems = async () => {
      try {
        const { data } = await fetchFunction();
        setItems(data);
      } catch (err) {
        setError((err as Error).message);
        showModal(`Error: ${(err as Error).message}`, "error"); 
      }
    };

    getItems();
  }, [fetchFunction, showModal]);

  if (error) {
    showModal(`Error: ${error}`, "error"); 
    return <p className="text-red-600">Error: {error}</p>;
  }

  return (
    <div className="flex flex-col w-full">
      <h2 className="self-start text-left text-2xl font-semibold tracking-tight pb-3">{title}</h2>

      <ul className="list-none flex flex-col gap-4 p-0">
        {items.length > 0 ? (
          items.map((item, index) => (
            <li key={`item-${index}`}>
              {renderItem(item)}
            </li>
          ))
        ) : (
          <p className="text-gray-500">Inga resultat hittades.</p>
        )}
      </ul>
    </div>
  );
};

export default ListComponent;
