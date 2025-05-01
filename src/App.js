import React, { Fragment, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./redux/actions"; // Đường dẫn đúng theo dự án của bạn
import DefaultComponent from "./components/DefaultComponent/DefaultComponent";
import { routes } from "./routes";
import { jwtDecode } from "jwt-decode";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          dispatch(login(JSON.parse(user), token));
        } else {
          localStorage.clear(); // Token hết hạn thì xóa localStorage
        }
      } catch (error) {
        console.error("Lỗi khi decode token:", error);
        localStorage.clear(); // Nếu token lỗi, xóa luôn
      }
    }
  }, [dispatch]);

  return (
    <div>
      <Router>
        <Routes>
          {routes.map((route) => {
            const Page = route.page;
            const Layout = route.isShowHeader ? DefaultComponent : Fragment;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
