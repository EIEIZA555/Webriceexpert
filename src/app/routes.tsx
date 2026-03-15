import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Plots from "./pages/Plots";
import Calendar from "./pages/Calendar";
import Admin from "./pages/Admin";
import Knowledge from "./pages/Knowledge";
import CreatePlan from "./pages/CreatePlan";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
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
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
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
        path: "knowledge",
        element: <Knowledge />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
