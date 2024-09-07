import React, { useState, useEffect, useCallback } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import "../../css/GeneralForm.css";

const API_BASE_URL = "https://localhost:7009/api";

const GeneralForm = () => {
  const [email, setEmail] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to retrieve email");

      const { email } = await response.json();
      setInitialEmail(email);
      setEmail(email);
    } catch (err) {
      setMessage({ type: "danger", content: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmail();
  }, [fetchEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage({ type: "danger", content: "Email cannot be empty" });
      return;
    }

    if (trimmedEmail === initialEmail) {
      setMessage({ type: "danger", content: "Email has not changed" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/change-profile-info`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!response.ok) throw new Error("Failed to update email");

      setMessage({ type: "success", content: "Email updated successfully!" });
      setInitialEmail(trimmedEmail);
    } catch (err) {
      setMessage({ type: "danger", content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="general-form">
      <h2>General Information</h2>
      {message.content && (
        <Alert variant={message.type}>{message.content}</Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          className="fancy-button"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Email"}
        </Button>
      </Form>
    </Container>
  );
};

export default GeneralForm;
