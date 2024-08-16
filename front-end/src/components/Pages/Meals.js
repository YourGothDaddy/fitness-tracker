import React, { useEffect, useState } from 'react';

const Meals = () => {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('https://localhost:7009/api/meal')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(() => setMessage('Error fetching data'));
  }, []);

  return (
    <div>
      <h1>Message from the Server:</h1>
      <p>{message}</p>
    </div>
  );
};

export default Meals;
