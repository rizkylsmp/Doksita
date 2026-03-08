import { createHashRouter } from "react-router-dom";
import RootLayout from "../layout/RootLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import WorkspacePage from "../pages/WorkspacePage";
import WorkspaceFormPage from "../pages/WorkspaceFormPage";
import WorkspacePreviewPage from "../pages/WorkspacePreviewPage";
import DocumentationPage from "../pages/DocumentationPage";
import InformationPage from "../pages/InformationPage";
import ProfilePage from "../pages/ProfilePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

const router = createHashRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "workspace",
            element: <WorkspacePage />,
          },
          {
            path: "workspace/create",
            element: <WorkspaceFormPage />,
          },
          {
            path: "workspace/edit/:id",
            element: <WorkspaceFormPage />,
          },
          {
            path: "workspace/preview",
            element: <WorkspacePreviewPage />,
          },
          {
            path: "documentation",
            element: <DocumentationPage />,
          },
          {
            path: "information",
            element: <InformationPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
]);

export default router;
