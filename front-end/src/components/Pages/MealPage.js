import React, { useContext, useEffect, useState } from 'react';
import MealForm from '../Forms/MealForm';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../Contexts/AuthContext';
import '../../css/Register.css';

const MealPage = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated === null) {
            setLoading(true);
        } else if (isAuthenticated) {
            setLoading(false);
        } else if (!isAuthenticated) {
            setLoading(false);
            navigate('/')
        }
    }, [isAuthenticated]);

    if (loading) {
        return null;
    }

    return <MealForm />;
}

export default MealPage;
