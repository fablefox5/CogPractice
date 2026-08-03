import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const authContext = useAuth()
  const location = useLocation()

  const isAuthenticated = Boolean((authContext?.token && authContext?.user)); 


  return isAuthenticated ? (
    <Outlet />
  ) : (
    authContext?.authReady ?
    <Navigate to="/login" state={{from: location}} replace />
    :
    <h1>Loading...</h1>
  )
}