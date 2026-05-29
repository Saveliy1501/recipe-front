import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_SUCCESS,
  GET_ERRORS,
  CLEAR_MESSAGE,
  SYNC_USER_DATA,
} from "./types";
import axiosInstance from "../../utils/axios";

export const register =
  ({ username, email, password, confirmPassword }) =>
  (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (password === confirmPassword) {
      const body = JSON.stringify({
        username,
        email,
        password,
      });

      axiosInstance
        .post("/user/register/", body, config)
        .then((res) => {
          dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data,
          });
          dispatch({
            type: CLEAR_MESSAGE,
            payload: res.data,
          });
          // После регистрации синхронизируем данные
          dispatch(syncUserData());
        })
        .catch((err) => {
          dispatch({
            type: GET_ERRORS,
            payload: err.response,
          });
          dispatch({
            type: REGISTER_FAIL,
          });
        });
    } else {
      dispatch({
        type: GET_ERRORS,
        payload: {
          data: { password: ["Passwords Must Match"] },
          status: null,
        },
      });
    }
  };

export const login =
  ({ email, password }) =>
  (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({ email, password });

    axiosInstance
      .post("/user/login/", body, config)
      .then((res) => {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: res.data,
        });
        dispatch({
          type: CLEAR_MESSAGE,
          payload: res.data,
        });
        // После входа синхронизируем данные
        dispatch(syncUserData());
      })
      .catch((err) => {
        dispatch({
          type: GET_ERRORS,
          payload: err.response,
        });
        dispatch({
          type: LOGIN_FAIL,
        });
      });
  };

export const logout = ({ refresh }) => async (dispatch, getState) => {
  try {
    const body = JSON.stringify({ refresh });
    await axiosInstance.post("/user/logout/", body, tokenConfig(getState));
    
    // Очищаем localStorage
    localStorage.removeItem("recipe");
    localStorage.removeItem("likedRecipes");
    localStorage.removeItem("savedRecipes");
    
    dispatch({
      type: LOGOUT_SUCCESS,
    });
  } catch (err) {
    // Даже если сервер вернул ошибку, все равно очищаем локальные данные
    localStorage.removeItem("recipe");
    localStorage.removeItem("likedRecipes");
    localStorage.removeItem("savedRecipes");
    
    dispatch({
      type: LOGOUT_SUCCESS,
    });
    
    dispatch({
      type: GET_ERRORS,
      payload: err.response,
    });
  }
};

// НОВЫЙ ACTION - синхронизация данных пользователя
export const syncUserData = () => async (dispatch, getState) => {
  try {
    const res = await axiosInstance.get("/user/sync/", tokenConfig(getState));
    
    // Сохраняем в localStorage
    const likedRecipes = {};
    res.data.liked_recipes.forEach(recipeId => {
      likedRecipes[recipeId] = true;
    });
    
    const savedRecipes = {};
    res.data.saved_recipes.forEach(recipeId => {
      savedRecipes[recipeId] = true;
    });
    
    localStorage.setItem("likedRecipes", JSON.stringify(likedRecipes));
    localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
    
    dispatch({
      type: SYNC_USER_DATA,
      payload: {
        likedRecipes,
        savedRecipes,
      },
    });
  } catch (err) {
    console.error("Sync error:", err);
  }
};

export const tokenConfig = (getState) => {
  const token = getState().auth.token;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token.access}`;
  }

  return config;
};