import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createRecipe } from "../../redux/actions/recipes";
import { useEffect } from "react";
import RecipeForm from "./recipe_form/RecipeForm";  

export default function RecipeCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { success } = useSelector((state) => state.recipes);
  const { token } = useSelector((state) => state.auth); // Добавить получение токена

  const handleFormSubmit = (formData) => {
    // Проверка наличия токена
    if (!token) {
      console.error("No authentication token");
      navigate("/login");
      return;
    }
    dispatch(createRecipe(formData, navigate));
  };

  useEffect(() => {
    if (success) {
      navigate("/dashboard");
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