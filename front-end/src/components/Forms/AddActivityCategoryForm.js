import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import CustomForm from "../CustomForm.js";

const AddActivityCategoryForm = () => {
  const [activityCategory, setActivityCategory] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await fetch(
        "https://localhost:7009/api/admin/add-activity-category",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: activityCategory }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };

  const handleChange = (e) => {
    setActivityCategory(e.target.value);
  };

  const resetForm = () => {
    setActivityCategory("");
  };

  const formOptions = [
    {
      title: "Activity Category Name",
      type: "text",
      value: activityCategory,
      handleChange: handleChange,
      handleSubmit: handleSubmit,
      isRequired: true,
      placeholder: "Enter activity group name",
    },
  ];

  return (
    <>
      <CustomForm
        handleSubmit={handleSubmit}
        formOptions={formOptions}
        isLoading={isLoading}
        buttonText="Add activity category"
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
    </>
  );
};

export default AddActivityCategoryForm;
