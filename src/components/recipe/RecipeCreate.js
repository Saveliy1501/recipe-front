import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createRecipe } from "../../redux/actions/recipes";
import { useEffect } from "react";
import RecipeForm from "./recipe_form/RecipeForm";  

export default function RecipeCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Берём состояние из Redux — создан ли рецепт, есть ли ошибка
  const { success } = useSelector((state) => state.recipes);

  const handleFormSubmit = (formData) => {
    dispatch(createRecipe(formData,navigate));
  };

  // Следим за успешным созданием
  useEffect(() => {
    if (success) {
      navigate("/dashboard");  // или "/recipe" — куда хочешь
    }
  }, [success, navigate]);

  return (
    <div>
      <RecipeForm
        buttonLabel="Create"
        editMode={false}
        handleFormSubmit={handleFormSubmit}
      />
    </div>
  );
}