import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Plots from "./pages/Plots";
import PlotDashboard from "./pages/PlotDashboard";
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
    path: "/register",
    Component: Register,
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
        element: <Navigate to="/app/plots" replace />,
      },
      {
        path: "plots",
        element: <Plots />,
      },
      {
        path: "plots/:id",
        element: <PlotDashboard />,
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
        element: (
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: "create-plan",
        element: <CreatePlan />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
