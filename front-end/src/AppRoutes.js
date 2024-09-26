import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Pages/Home";
import Register from "./components/Pages/RegisterPage";
import Login from "./components/Pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileNavigation from "./components/Navigations/ProfileNavigation";
import GeneralForm from "./components/Forms/GeneralForm";
import GoalsForm from "./components/Forms/GoalsForm";
import DashboardPage from "./components/Pages/DashboardPage";
import AdminNavigation from "./components/Navigations/AdminNavigation";
import AddConsumableForm from "./components/Forms/AddConsumableForm";
import AddedConsumablesPage from "./components/Pages/AddedConsumablesPage";
import ActivitiesPage from "./components/Pages/ActivitiesPage";
import UnauthorizedPage from "./components/Pages/UnauthorizedPage";
import NotFoundPage from "./components/Pages/404Page";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute isForAdmin={true}>
            <AdminNavigation />
          </ProtectedRoute>
        }
      >
        <Route index element={<AddConsumableForm />} />
        <Route path="add-consumable" element={<AddConsumableForm />} />
        <Route path="added-consumables" element={<AddedConsumablesPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
      </Route>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileNavigation />
          </ProtectedRoute>
        }
      >
        <Route index element={<GeneralForm />} />
        <Route path="general" element={<GeneralForm />} />
        <Route path="goals" element={<GoalsForm />} />
      </Route>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
