import React, { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";

const API_URL = "https://localhost:7009/api/consumable/search";

const AddedConsumablesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    if (searchTerm.length === 0) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}?query=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const debouncedFetch = debounce(fetchResults, 300);
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [fetchResults]);

  const handleResultClick = (item) => {
    // REMOVE console.log("Selected item:", item);
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for food, drink, or meal..."
          className="search-input"
        />
        {isLoading && <div className="loader"></div>}
        {!isLoading && searchTerm && (
          <ul className="search-results">
            {results.length === 0 ? (
              <li className="no-results">No results found</li>
            ) : (
              results.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleResultClick(item)}
                  className="search-result-item"
                >
                  {item}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddedConsumablesPage;
