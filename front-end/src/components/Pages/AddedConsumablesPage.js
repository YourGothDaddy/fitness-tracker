import React, { useState, useEffect } from 'react';

const AddedConsumablesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (searchTerm.length === 0) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`https://localhost:7009/api/consumable/search?query=${searchTerm}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                } else {
                    console.error('Error fetching data:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleResultClick = (item) => {
        console.log('Selected item:', item);
    };

    return (
        <div className="search-container">
            <div className="search-box">
                <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={handleInputChange} 
                    placeholder="Search for food, drink, or meal..."
                    className="search-input"
                />
                {isLoading && <div className="loader"></div>}
                <ul className="search-results">
                    {!isLoading && searchTerm.length > 0 && results.length === 0 && (
                        <li className="no-results">No results found</li>
                    )}
                    {results.map((item, index) => (
                        <li key={index} onClick={() => handleResultClick(item)} className="search-result-item">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AddedConsumablesPage;
