export const isAuthenticated = () => {
  return !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  window.location.href = "/login";
}; 