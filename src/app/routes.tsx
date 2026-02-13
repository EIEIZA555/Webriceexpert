import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Plots from "./pages/Plots";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Todos from "./pages/Todos";
import Knowledge from "./pages/Knowledge";
import CreatePlan from "./pages/CreatePlan";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/create-plan",
    element: (
      <ProtectedRoute>
        <CreatePlan />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "plots",
        element: <Plots />,
      },
      {
        path: "calendar",
        element: <Calendar />,
      },
      {
        path: "todos",
        element: <Todos />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "knowledge",
        element: <Knowledge />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
