import HomePage from "../pages/HomePage/HomePage";
import MovieDetailPage from "../pages/MovieDetailPage/MovieDetailPage";
import MoviePage from "../components/MoviePage/MoviePage";
import TheaterPage from "../pages/TheaterPage/TheaterPage";
import AdminTheaterManagement from "../components/AdminTheaterManagement/AdminTheaterManagement";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import AdminVoucherManagement from "../pages/AdminVoucherManagement/AdminVoucherManagement";

export const routes = [
    {
        path: "/",
        page: HomePage,
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
        path: "/profile", 
        page: ProfilePage,
        isShowHeader: true,
    },
    {
        path: "/admin/voucher-management",
        page: AdminVoucherManagement,
        isShowHeader: true,
      },
];