import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import RecipeCard from "./RecipeCard";
import { getRecommendations } from "../../redux/actions/recipes";
import { SparklesIcon, PlusCircleIcon } from "@heroicons/react/outline";

export default function Recommendations() {
  const dispatch = useDispatch();
  const { 
    recommendations, 
    recommendationsType, 
    recommendationsMessage, 
    recommendationsHas, 
    recommendationsLoaded,
    is_loading 
  } = useSelector((state) => state.recipes);
  const { user } = useSelector((state) => state.user);

  // Загружаем рекомендации ТОЛЬКО если они еще не загружены и есть пользователь
  useEffect(() => {
    if (user && user.id && !recommendationsLoaded) {
      dispatch(getRecommendations());
    }
  }, [dispatch, user, recommendationsLoaded]);

  // Если еще не загружали и идет загрузка
  if (!recommendationsLoaded && is_loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
        <p className="mt-4 text-gray-500">Loading recommendations...</p>
      </div>
    );
  }

  // Если нет рекомендаций
  if (!recommendationsHas || !recommendations || recommendations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No recommendations yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          {recommendationsType === 'empty' 
            ? "There are no recipes available for recommendations right now."
            : "Start saving and liking recipes to get personalized recommendations!"}
        </p>
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={() => window.location.href = '/recipe'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
          >
            Explore Recipes
          </button>
          <button
            onClick={() => window.location.href = '/recipe/create'}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Create Recipe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="h-6 w-6 text-teal-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-sm text-gray-500 mt-0.5">{recommendationsMessage}</p>
            {recommendationsType === 'ingredient_based' && (
              <p className="text-xs text-teal-600 mt-1">
                Based on ingredients from your saved recipes
              </p>
            )}
            {recommendationsType === 'popular' && (
              <p className="text-xs text-teal-600 mt-1">
                🔥 Popular recipes from the community
              </p>
            )}
          </div>
        </div>
      </div>
      
      <RecipeCard recipes={recommendations} quickview={true} />
    </div>
  );
}