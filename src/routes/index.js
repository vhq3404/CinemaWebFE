import HomePage from "../pages/HomePage/HomePage";
import MovieDetailPage from "../pages/MovieDetailPage/MovieDetailPage";
import MoviePage from "../components/MoviePage/MoviePage";
import TheaterPage from "../pages/TheaterPage/TheaterPage";
import AdminTheaterManagement from "../components/AdminTheaterManagement/AdminTheaterManagement";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import BookingPage from "../pages/BookingPage/BookingPage";
import NewsPage from "../pages/NewsPage/NewsPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage/PaymentSuccessPage";
import EmployeeDashboard from "../pages/EmployeeDashboard/EmployeeDashboard";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";


export const routes = [
  {
    path: "/admin/dashboard",
    page: AdminDashboard,
    isShowHeader: true,
  },
  {
    path: "/news",
    page: NewsPage,
    isShowHeader: true,
  },
  {
    path: "/",
    page: HomePage,
    isShowHeader: true,
  },
   {
    path: "/admin/dashboard",
    page: AdminDashboard,
    isShowHeader: true,
  },
  {
    path: "/movies",
    page: MoviePage,
    isShowHeader: true,
  },
  {
    path: "/movie/:id",
    page: MovieDetailPage,
    isShowHeader: true,
  },

  {
    path: "/theater",
    page: TheaterPage,
    isShowHeader: true,
  },
  {
    path: "/management",
    page: AdminTheaterManagement,
    isShowHeader: true,
  },
  {
    path: "/profile/:tab?",
    page: ProfilePage,
    isShowHeader: true,
  },

  {
    path: "/booking",
    page: BookingPage,
    isShowHeader: true,
  },

  {
    path: "/payment-success",
    page: PaymentSuccessPage,
    isShowHeader: true,
  },
];
