import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";

export const routes = [
    {
      path: "/",
      page: HomePage,
      isShowHeader: true,
    },

    {
        path: "/login",
        page: LoginPage,
        isShowHeader: false,
      },
];
