/* eslint-disable import/no-anonymous-default-export */
import {
  RECIPE_LOADING,
  GET_RECIPES,
  GET_DETAIL_RECIPE,
  CLEAR_RECIPE,
  CREATE_RECIPE,
  LIKE_RECIPE,
  EDIT_RECIPE,
  DELETE_RECIPE,
  SAVE_RECIPE,
  UNLIKE_RECIPE,
  REMOVE_SAVED_RECIPE,
} from "../actions/types";

const initialState = {
  is_loading: false,
  recipes: null,
  detailRecipe: null,
  likedRecipe: null,
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
    case LIKE_RECIPE:
      return {
        ...state,
        is_loading: false,
        // Обновляем счётчик лайков в списке рецептов
        recipes: state.recipes?.map(recipe =>
          recipe.id === action.payload.id
            ? { ...recipe, total_number_of_likes: (recipe.total_number_of_likes || 0) + 1 }
            : recipe
        ),
        // Обновляем счётчик лайков в детальном рецепте
        detailRecipe: state.detailRecipe?.id === action.payload.id
          ? { ...state.detailRecipe, total_number_of_likes: (state.detailRecipe.total_number_of_likes || 0) + 1 }
          : state.detailRecipe,
      };

    case UNLIKE_RECIPE:
      return {
        ...state,
        is_loading: false,
        // Обновляем счётчик лайков в списке рецептов
        recipes: state.recipes?.map(recipe =>
          recipe.id === action.payload.id
            ? { ...recipe, total_number_of_likes: Math.max((recipe.total_number_of_likes || 0) - 1, 0) }
            : recipe
        ),
        // Обновляем счётчик лайков в детальном рецепте
        detailRecipe: state.detailRecipe?.id === action.payload.id
          ? { ...state.detailRecipe, total_number_of_likes: Math.max((state.detailRecipe.total_number_of_likes || 0) - 1, 0) }
          : state.detailRecipe,
      };

    case REMOVE_SAVED_RECIPE:
      return {
        ...state,
        is_loading: false,
        // Обновляем счётчик сохранений в списке рецептов
        recipes: state.recipes?.map(recipe =>
          recipe.id === action.payload.recipe_id
            ? { ...recipe, total_number_of_bookmarks: Math.max((recipe.total_number_of_bookmarks || 0) - 1, 0) }
            : recipe
        ),
        // Обновляем счётчик сохранений в детальном рецепте
        detailRecipe: state.detailRecipe?.id === action.payload.recipe_id
          ? { ...state.detailRecipe, total_number_of_bookmarks: Math.max((state.detailRecipe.total_number_of_bookmarks || 0) - 1, 0) }
          : state.detailRecipe,
      };
    case DELETE_RECIPE:
      return {
        ...state,
        is_loading: false,
      };
    case SAVE_RECIPE:
      return {
        ...state,
        is_loading: false,
      };
    default:
      return state;
  }
}
