import React, { useState, useEffect } from 'react';
import '../../css/GeneralForm.css';
import { Form, Button, Container } from 'react-bootstrap';

const GeneralForm = () => {
  const [email, setEmail] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://localhost:7009/api/user/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Retrieving email failed');
        }

        const data = await response.json();
        setInitialEmail(data.email);
        setEmail(data.email);
        setErrorMessage('');
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmail();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Email cannot be empty');
      setSuccessMessage('');
      return;
    }

    if(email == initialEmail){
      setErrorMessage('Email has not changed');
      setSuccessMessage('');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://localhost:7009/api/user/change-profile-info', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Changing data failed');
      }

      setSuccessMessage('Email updated successfully!');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="general-form">
      <h2>General Information</h2>
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      <Form onSubmit={handleSubmit} className="general-form">
        <Form.Group controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="fancy-button" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Email'}
        </Button>
      </Form>
    </Container>
  );
};

export default GeneralForm;
