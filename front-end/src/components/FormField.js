import React from 'react';

const FormField = ({ id, label, type, value, onChange, placeholder, required }) => (
    <div className="form-group">
        <label htmlFor={id} className="form-label">{label}</label>
        <input
            type={type}
            className="form-control"
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
        />
    </div>
);

export default FormField;