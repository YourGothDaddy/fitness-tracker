import React, { useState } from 'react';
import FormField from '../FormField';

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            await registerUser(email, password);
            resetForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const registerUser = async (email, password) => {
        const response = await fetch('https://localhost:7009/api/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <FormField
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                    <FormField
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                    <button type="submit" className="btn btn-primary btn-block">
                        Register
                    </button>
                    <div className="login-link">
                        Already have an account? <a href="/login">Login</a>
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
