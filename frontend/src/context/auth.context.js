import { createContext, useContext } from "react";

//? context + hook are kept in this plain file so that AuthContext.jsx
//? exports only the provider component (vite fast refresh complains otherwise)
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
