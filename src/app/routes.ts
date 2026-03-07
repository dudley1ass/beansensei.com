import { createBrowserRouter } from "react-router";
import { Root } from "./pages/root";
import { Home } from "./pages/home";
import { BlendBuilderPage } from "./pages/blend-builder-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "blend-builder", Component: BlendBuilderPage },
    ],
  },
]);
