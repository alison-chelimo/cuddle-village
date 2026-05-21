import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";
import Orders from "./pages/Orders";                        // ✅ user orders kept as Orders
import Verify from "./pages/Verify";
import BookClubRegister from "./pages/BookClubRegister";
import EarlyLearnersHub from "./pages/EarlyLearnersHub";
import GrowingReadersHub from "./pages/GrowingReadersHub";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";        // ✅ renamed to AdminOrders
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import Users from "./pages/admin/Users";
import OrderSuccess from "./pages/OrderSuccess";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import ContactUs from "./pages/ContactUs";
import Blog from "./pages/Blog";
import Footer from "./components/Footer";
import AboutUs from "./pages/AboutUs";
import BookClub from "./pages/BookClub";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>  // ✅ user Orders
        } />
        <Route path="/verify" element={<Verify />} />
        <Route path="/book-club" element={<BookClub />} />
        <Route path="/book-club/register" element={<BookClubRegister />} />
        <Route path="/early-learners" element={<EarlyLearnersHub />} />
        <Route path="/growing-readers" element={<GrowingReadersHub />} />

        {/* Admin Routes */}
        <Route path="/admin/admin-dashboard" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/admin/products" element={
          <AdminRoute><AdminProducts /></AdminRoute>   // ✅ AdminProducts not Products
        } />
        <Route path="/admin/products/add" element={
          <AdminRoute><AddProduct /></AdminRoute>
        } />
        <Route path="/admin/products/edit/:id" element={
          <AdminRoute><EditProduct /></AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute><Users /></AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute><AdminOrders /></AdminRoute>     // ✅ AdminOrders not Orders
        } />

        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;