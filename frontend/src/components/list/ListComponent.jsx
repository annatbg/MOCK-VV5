import React, { useState, useEffect } from "react";
import "./ListComponent.css";
import PropTypes from "prop-types";

const ListComponent = ({ fetchFunction, title, renderItem }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getItems = async () => {
      try {
        const data = await fetchFunction();
        setItems(data.data); // Se till att detta matchar backend-svaret
      } catch (err) {
        setError(err.message);
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
            <li className="listItem" key={item.demand?.demandId || `item-${index}`}>
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

ListComponent.propTypes = {
  fetchFunction: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  renderItem: PropTypes.func.isRequired,
};

export default ListComponent;
