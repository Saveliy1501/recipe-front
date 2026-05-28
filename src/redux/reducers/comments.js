/* eslint-disable import/no-anonymous-default-export */
import {
  GET_COMMENTS,
  ADD_COMMENT,
  DELETE_COMMENT,
  LOGOUT_SUCCESS,
} from "../actions/types";

const initialState = {
  comments: {}, // { recipeId: [comments] }
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_COMMENTS:
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.recipeId]: action.payload.comments,
        },
      };
    case ADD_COMMENT:
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.recipeId]: [
            action.payload.comment,
            ...(state.comments[action.payload.recipeId] || []),
          ],
        },
      };
    case DELETE_COMMENT:
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.recipeId]: state.comments[action.payload.recipeId]?.filter(
            (comment) => comment.id !== action.payload.commentId
          ),
        },
      };
    case LOGOUT_SUCCESS:
      return {
        ...initialState,
      };
    default:
      return state;
  }
}