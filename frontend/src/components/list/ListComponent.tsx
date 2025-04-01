import React, { useState, useEffect } from "react";
import "./ListComponent.css";

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
        const data = await fetchFunction();
        setItems(data.data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    getItems();
  }, [fetchFunction]);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="listContainer">
      <h2 className="listHeader">{title}</h2>
      <ul className="list">
        {items.length > 0 ? (
          items.map((item, index) => (
            <li className="listItem" key={(item as any).demand?.demandId || `item-${index}`}>
              {renderItem(item)}
            </li>
          ))
        ) : (
          <p>Inga resultat hittades.</p>
        )}
      </ul>
    </div>
  );
};

export default ListComponent;