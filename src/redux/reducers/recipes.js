/* eslint-disable import/no-anonymous-default-export */
import {
  RECIPE_LOADING,
  GET_RECIPES,
  GET_DETAIL_RECIPE,
  CLEAR_RECIPE,
  CREATE_RECIPE,
  EDIT_RECIPE,
  DELETE_RECIPE,
  GET_RECOMMENDATIONS,
  LOGOUT_SUCCESS,
  CLEAR_RECIPE_SUCCESS,
} from "../actions/types";

const initialState = {
  is_loading: false,
  recipes: null,
  detailRecipe: null,
  likedRecipe: null,
  recommendations: null,
  recommendationsType: null,
  recommendationsMessage: null,
  recommendationsHas: false,
  recommendationsLoaded: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case RECIPE_LOADING:
      return {
        ...state,
        is_loading: true,
      };
    case GET_RECIPES:
      return {
        ...state,
        is_loading: false,
        recipes: action.payload,
      };
    case GET_DETAIL_RECIPE:
      return {
        ...state,
        is_loading: false,
        detailRecipe: action.payload,
      };
    case GET_RECOMMENDATIONS:
      return {
        ...state,
        is_loading: false,
        recommendations: action.payload.recommendations,
        recommendationsType: action.payload.type,
        recommendationsMessage: action.payload.message,
        recommendationsHas: action.payload.has_recommendations,
        recommendationsLoaded: true,
      };
    case CLEAR_RECIPE:
      return {
        ...state,
        is_loading: false,
        recipes: null,
      };
    case CREATE_RECIPE:
      return {
        ...state,
        is_loading: false,
        success: true,  
      };
    case EDIT_RECIPE:
      return {
        ...state,
        is_loading: false,
      };
    case DELETE_RECIPE:
      return {
        ...state,
        is_loading: false,
      };
    case LOGOUT_SUCCESS:
      return {
        ...initialState,
      };
    case CLEAR_RECIPE_SUCCESS:
      return {
        ...state,
        success: false,
      };
    default:
      return state;
  }
}