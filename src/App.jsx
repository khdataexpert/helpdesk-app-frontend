import { RouterProvider } from "react-router-dom";
import router from "./routes/Router";
import ThemeInitializer from "./Components/ThemeInitializer/ThemeInitializer";

function App() {
  return (
    <>
      <ThemeInitializer />
      <RouterProvider router={router} />;
    </>
  )
}

export default App;
