import { Navigate } from "react-router-dom";

function FacilitatorRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user || (user.role !== "admin" && user.role !== "facilitator")) {
    return <Navigate to="/" />;
  }
  return children;
}

export default FacilitatorRoute;
