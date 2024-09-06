import React from "react";
import AddActivityCategoryForm from "../Forms/AddActivityCategoryForm";
import AddActivityTypeForm from "../Forms/AddActivityTypeForm";
import "../../css/ActivitiesPage.css";

const ActivitiesPage = () => {
  return (
    <div className="main-section">
      <div className="left-section">
        <AddActivityTypeForm />
      </div>
      <div className="right-section">
        <AddActivityCategoryForm />
      </div>
    </div>
  );
};
export default ActivitiesPage;
