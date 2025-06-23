import HomePage from "../pages/HomePage/HomePage";
import MovieDetailPage from "../pages/MovieDetailPage/MovieDetailPage";
import MoviePage from "../pages/MoviePage/MoviePage";
import TheaterPage from "../pages/TheaterPage/TheaterPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import BookingPage from "../pages/BookingPage/BookingPage";
import NewsPage from "../pages/NewsPage/NewsPage";
import FeedbackPage from "../pages/FeedbackPage/FeedbackPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage/PaymentSuccessPage";
import EmployeeDashboard from "../pages/EmployeeDashboard/EmployeeDashboard";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";

export const routes = [
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
    path: "/employee/dashboard",
    page: EmployeeDashboard,
    isShowHeader: true,
  },
  {
    path: "/news",
    page: NewsPage,
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
  {
    path: "/feedback",
    page: FeedbackPage,
    isShowHeader: true,
  },
];
