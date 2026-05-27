import {
  RECIPE_LOADING,
  GET_RECIPES,
  GET_DETAIL_RECIPE,
  GET_ERRORS,
  CREATE_RECIPE,
  LIKE_RECIPE,
  EDIT_RECIPE,
  DELETE_RECIPE,
  SAVE_RECIPE,
  UNLIKE_RECIPE,
  REMOVE_SAVED_RECIPE,
  GET_RECOMMENDATIONS, 
  LOAD_USER_LIKES,     
  LOAD_USER_SAVES,
} from "./types";
import axiosInstance from "../../utils/axios";
import { tokenConfig } from "./auth";

export const getRecipes = (searchTerm = '', categoryName = '', authorName = '', ordering = '') => (dispatch) => {
  dispatch({ type: RECIPE_LOADING });

  let url = '/recipe/';
  const params = new URLSearchParams();
  
  if (searchTerm) {
    params.append('search', searchTerm);
  }
  if (categoryName) {
    params.append('category__name', categoryName);
  }
  if (authorName) {
    params.append('author__username', authorName);
  }
  
  if (ordering) {
    params.append('ordering', ordering);
  }
  
  const queryString = params.toString();
  if (queryString) {
    url = `/recipe/?${queryString}`;
  }

  axiosInstance
    .get(url)
    .then((res) => {
      dispatch({
        type: GET_RECIPES,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response,
      });
    });
};

export const getDetailRecipe = (id) => (dispatch, getState) => {
  dispatch({ type: RECIPE_LOADING });

  axiosInstance
    .get(`/recipe/${id}/`, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_DETAIL_RECIPE,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response,
      });
    });
};

export const createRecipe = (formData, navigate) => (dispatch, getState) => {
  dispatch({ type: RECIPE_LOADING });

  axiosInstance
    .post("/recipe/create/", formData, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: CREATE_RECIPE,
        payload: res.data,
      });
      navigate("/recipe");
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response,
      });
    });
};

export const editRecipe = (id, formData, navigate) => (dispatch, getState) => {
  dispatch({ type: RECIPE_LOADING });

  axiosInstance
    .patch(`/recipe/${id}/`, formData, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: EDIT_RECIPE,
        payload: res.data,
      });
      navigate("/recipe");
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response,
      });
    });
};

export const deleteRecipe = (id, navigate, closeModal) => (dispatch, getState) => {
  dispatch({ type: RECIPE_LOADING });

  axiosInstance
    .delete(`/recipe/${id}/`, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: DELETE_RECIPE,
        payload: res.data,
      });
      if (closeModal) closeModal(false);
      navigate("/recipe");
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response,
      });
    });
};

export const likeRecipe = (id) => async (dispatch, getState) => {
  try {
    await axiosInstance.post(`/recipe/${id}/like/`, null, tokenConfig(getState));
    return { id };
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
      payload: err.response,
    });
    throw err;
  }
};

export const unlikeRecipe = (id) => async (dispatch, getState) => {
  try {
    await axiosInstance.delete(`/recipe/${id}/like/`, tokenConfig(getState));
    return { id };
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
      payload: err.response,
    });
    throw err;
  }
};

// ИСПРАВЛЕННЫЙ saveRecipe - возвращает Promise
export const saveRecipe = (user_id, id) => async (dispatch, getState) => {
  try {
    const body = JSON.stringify({ id });
    const res = await axiosInstance.post(`/user/profile/${user_id}/bookmarks/`, body, tokenConfig(getState));
    dispatch({
      type: SAVE_RECIPE,
      payload: { id, user_id },  // ВАЖНО: передаем id рецепта
    });
    return { id, user_id };
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
      payload: err.response,
    });
    throw err;
  }
};

// ИСПРАВЛЕННЫЙ removeSavedRecipe - возвращает Promise
export const removeSavedRecipe = (user_id, recipe_id) => async (dispatch, getState) => {
  try {
    const res = await axiosInstance.delete(`/user/profile/${user_id}/bookmarks/?recipe_id=${recipe_id}`, tokenConfig(getState));
    dispatch({
      type: REMOVE_SAVED_RECIPE,
      payload: { recipe_id, user_id },
    });
    return { recipe_id, user_id };
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
      payload: err.response,
    });
    throw err;
  }
};

export const getRecommendations = () => async (dispatch, getState) => {
  try {
    const res = await axiosInstance.get('/recipe/recommendations/', tokenConfig(getState));
    dispatch({
      type: GET_RECOMMENDATIONS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
      payload: err.response,
    });
  }
};

export const updateLikeCount = (recipeId, newCount) => ({
  type: UPDATE_LIKE_COUNT,
  payload: { recipeId, newCount }
});

// Экшен для обновления счетчика сохранений
export const updateSaveCount = (recipeId, newCount) => ({
  type: UPDATE_SAVE_COUNT,
  payload: { recipeId, newCount }
});

