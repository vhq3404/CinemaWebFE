import HomePage from "../pages/HomePage/HomePage";
import MovieDetailPage from "../pages/HomePage/MovieDetailPage";
import TrendingMoviesPage from "../pages/HomePage/TrendingMoviesPage";
import MoviePage from "../components/MoviePage/MoviePage";

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
];