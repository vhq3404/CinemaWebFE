import HomePage from "../pages/HomePage/HomePage";
import MovieDetailPage from "../pages/MovieDetailPage/MovieDetailPage";
import MoviePage from "../components/MoviePage/MoviePage";
import TheaterPage from "../components/TheaterPage/TheaterPage";
import AdminTheaterManagement from "../components/AdminTheaterManagement/AdminTheaterManagement";

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
        path: "/trending-movies",
        page: TrendingMoviesPage,
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
];