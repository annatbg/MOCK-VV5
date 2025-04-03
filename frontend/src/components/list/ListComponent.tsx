import { useState, useEffect } from "react";

type ListComponentProps<T> = {
  fetchFunction: () => Promise<{ data: T[] }>;
  title: string;
  renderItem: (item: T) => React.ReactNode;
};

const ListComponent = <T,>({ fetchFunction, title, renderItem }: ListComponentProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getItems = async () => {
      try {
        const { data } = await fetchFunction();
        setItems(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    getItems();
  }, [fetchFunction]);

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  return (
    <div className="flex flex-col w-full">
      <h2 className="self-start text-left text-2xl font-semibold tracking-tight pb-3">{title}</h2>

      <ul className="list-none flex flex-col gap-4 p-0">
        {items.length > 0 ? (
          items.map((item, index) => (
            <li key={`item-${index}`} className="border-b border-slate-500 pb-2">
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
