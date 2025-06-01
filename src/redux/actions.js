export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const UPDATE_USER = "UPDATE_USER";

export const login = (user, token) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  return {
    type: "LOGIN",
    payload: { user, token },
  };
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return {
    type: "LOGOUT",
  };
};

export const updateUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user)); 
  return {
    type: "UPDATE_USER",
    payload: user,
  };
};
