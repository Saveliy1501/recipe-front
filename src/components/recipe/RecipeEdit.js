import React, { useEffect } from "react";
import RecipeForm from "./recipe_form/RecipeForm";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { editRecipe, getDetailRecipe } from "../../redux/actions/recipes";

export default function RecipeEdit() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { recipes, detailRecipe, is_loading } = useSelector((state) => state.recipes);

  // Если рецептов ещё нет в списке, загружаем конкретный рецепт
  useEffect(() => {
    if (!recipes || recipes.length === 0) {
      dispatch(getDetailRecipe(id));
    }
  }, [dispatch, id, recipes]);

  // Берём рецепт из списка, если есть, или из detailRecipe
  const recipe = recipes?.filter((r) => r.id === parseInt(id)) || [];
  const finalRecipe = recipe.length > 0 ? recipe : (detailRecipe ? [detailRecipe] : []);

  const handleFormSubmit = (formData) => {
    dispatch(editRecipe(id, formData, navigate));
  };

  if (is_loading && finalRecipe.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading recipe...</p>
      </div>
    );
  }

  if (finalRecipe.length === 0 && !is_loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Recipe not found</p>
      </div>
    );
  }

  return (
    <div>
      <RecipeForm
        buttonLabel="Update"
        handleFormSubmit={handleFormSubmit}
        editMode={true}
        recipe={finalRecipe}
      />
    </div>
  );
}