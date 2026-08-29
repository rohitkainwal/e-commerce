import { RouterProvider } from "react-router-dom";
import { myRoutes } from "./routes/Routing.jsx";

const App = () => {
  return <RouterProvider router={myRoutes} />;
};

export default App;
