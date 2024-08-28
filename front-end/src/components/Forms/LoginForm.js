import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Contexts/AuthContext';
import FormField from '../FormField';

const LoginForm = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            await login(email, password);
            resetForm();
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Login</h2>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin}>
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
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
