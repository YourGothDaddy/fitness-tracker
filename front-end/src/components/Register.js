import React, {useState} from 'react';


const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
  
    const handleRegister = async (event) => {
      event.preventDefault();
  
      try {
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
  
        setEmail('');
        setPassword('');
      } catch (err) {
        setError(err.message);
      }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
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
    )
}
export default Register;