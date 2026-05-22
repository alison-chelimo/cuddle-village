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
import Orders from "./pages/Orders";
import Verify from "./pages/Verify";
import BookClubRegister from "./pages/BookClubRegister";
import EarlyLearnersHub from "./pages/EarlyLearnersHub";
import GrowingReadersHub from "./pages/GrowingReadersHub";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
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
import Profile from "./pages/Profile";
import ChildProgressPortal from "./pages/ChildProgressPortal";
import BookClubAdmin from "./pages/admin/BookClubAdmin";
import FacilitatorRoute from "./components/FacilitatorRoute";

// Facilitator portal pages
import FacilitatorDashboard   from "./pages/facilitator/FacilitatorDashboard";
import FacilitatorChildren    from "./pages/facilitator/Children";
import FacilitatorChildProfile from "./pages/facilitator/ChildProfile";
import FacilitatorSessions    from "./pages/facilitator/Sessions";
import FacilitatorSessionDetail from "./pages/facilitator/SessionDetail";
import FacilitatorBooks       from "./pages/facilitator/Books";
import FacilitatorAttendance  from "./pages/facilitator/Attendance";
import FacilitatorAnnouncements from "./pages/facilitator/Announcements";
import FacilitatorProfile     from "./pages/facilitator/FacilitatorProfile";

function Layout() {
  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/facilitator");

  return (
    <>
      {!isPortalRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/book-club" element={<BookClub />} />
        <Route path="/book-club/register" element={<BookClubRegister />} />
        <Route path="/early-learners" element={<EarlyLearnersHub />} />
        <Route path="/growing-readers" element={<GrowingReadersHub />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/portal/my-child" element={<ProtectedRoute><ChildProgressPortal /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/products/add" element={<AdminRoute><AddProduct /></AdminRoute>} />
        <Route path="/admin/products/edit/:id" element={<AdminRoute><EditProduct /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/book-club" element={<FacilitatorRoute><BookClubAdmin /></FacilitatorRoute>} />

        {/* Facilitator portal — own FacilitatorLayout, no Navbar/Footer */}
        <Route path="/facilitator/dashboard"     element={<FacilitatorRoute><FacilitatorDashboard /></FacilitatorRoute>} />
        <Route path="/facilitator/children"      element={<FacilitatorRoute><FacilitatorChildren /></FacilitatorRoute>} />
        <Route path="/facilitator/children/:id"  element={<FacilitatorRoute><FacilitatorChildProfile /></FacilitatorRoute>} />
        <Route path="/facilitator/sessions"      element={<FacilitatorRoute><FacilitatorSessions /></FacilitatorRoute>} />
        <Route path="/facilitator/sessions/:id"  element={<FacilitatorRoute><FacilitatorSessionDetail /></FacilitatorRoute>} />
        <Route path="/facilitator/books"         element={<FacilitatorRoute><FacilitatorBooks /></FacilitatorRoute>} />
        <Route path="/facilitator/attendance"    element={<FacilitatorRoute><FacilitatorAttendance /></FacilitatorRoute>} />
        <Route path="/facilitator/announcements" element={<FacilitatorRoute><FacilitatorAnnouncements /></FacilitatorRoute>} />
        <Route path="/facilitator/profile"       element={<FacilitatorRoute><FacilitatorProfile /></FacilitatorRoute>} />
        <Route path="/facilitator/book-club"     element={<FacilitatorRoute><BookClubAdmin noLayout /></FacilitatorRoute>} />
      </Routes>
      {!isPortalRoute && <Footer />}
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
