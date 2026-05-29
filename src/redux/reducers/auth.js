/* eslint-disable import/no-anonymous-default-export */
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_SUCCESS,
  SYNC_USER_DATA,
} from "../actions/types";

const initialState = {
  token: JSON.parse(localStorage.getItem("recipe")),
  isAuthenticated: null,
  isLoading: false,
  user: null,
  likedRecipes: JSON.parse(localStorage.getItem("likedRecipes")) || {},
  savedRecipes: JSON.parse(localStorage.getItem("savedRecipes")) || {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      localStorage.setItem("recipe", JSON.stringify(action.payload.tokens));
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        isLoading: false,
        token: action.payload.tokens,
      };
    case SYNC_USER_DATA:
      return {
        ...state,
        likedRecipes: action.payload.likedRecipes,
        savedRecipes: action.payload.savedRecipes,
      };
    case LOGIN_FAIL:
    case REGISTER_FAIL:
      localStorage.removeItem("recipe");
      localStorage.removeItem("likedRecipes");
      localStorage.removeItem("savedRecipes");
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        likedRecipes: {},
        savedRecipes: {},
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        likedRecipes: {},
        savedRecipes: {},
      };
    default:
      return state;
  }
}