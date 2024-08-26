import React, { useState, useEffect } from 'react';
import '../../css/GeneralForm.css';
import { Form, Button, Container } from 'react-bootstrap';

const GeneralForm = () => {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await fetch('https://localhost:7009/api/user/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Retrieving email failed');
        }

        const data = await response.json();
        setEmail(data.email);
        setErrorMessage('');
      } catch (err) {
        setErrorMessage(err.message);
      }
    };

    fetchEmail();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://localhost:7009/api/user/change-profile-info', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });

      if (!response.ok) {
        throw new Error('Changing data failed');
      }
      setSuccessMessage('Success');
      setErrorMessage('');
    } catch (err) {
      setSuccessMessage('');
      setErrorMessage(err.message);
    }
  };

  return (
    <Container className="general-form">
      <h2>General Information</h2>
      {
        errorMessage != '' 
        ? (errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )) 
      :
        successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )
      }
      <Form onSubmit={handleSubmit} className="general-form">
        <Form.Group controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder={email}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="fancy-button">
          Update Email
        </Button>
      </Form>
    </Container>
  );
};

export default GeneralForm;
