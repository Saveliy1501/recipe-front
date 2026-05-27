import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { HeartIcon, BookmarkIcon } from "@heroicons/react/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/solid";
import { likeRecipe, unlikeRecipe, saveRecipe, removeSavedRecipe } from "../../redux/actions/recipes";
import QuickView from "./QuickView";

export default function RecipeCard({ recipes, quickview }) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [forceUpdate, setForceUpdate] = useState(0); // Для принудительного обновления

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const currentUserId = user?.id;

  // Функции для работы с localStorage
  const getLikedRecipes = () => JSON.parse(localStorage.getItem("likedRecipes")) || {};
  const getSavedRecipes = () => JSON.parse(localStorage.getItem("savedRecipes")) || {};

  // Функция для обновления счетчиков в UI
  const refreshUI = () => {
    setForceUpdate(prev => prev + 1);
  };

  const handleLike = async (recipeId, currentIsLiked) => {
    if (loadingStates[recipeId]) return;
    
    const currentLiked = getLikedRecipes();
    const currentLikeCount = currentLiked[`count_${recipeId}`] || (recipes?.find(r => r.id === recipeId)?.total_number_of_likes || 0);
    const newIsLiked = !currentIsLiked;
    const newLikeCount = newIsLiked ? currentLikeCount + 1 : Math.max(currentLikeCount - 1, 0);
    
    setLoadingStates(prev => ({ ...prev, [recipeId]: true }));
    
    // Обновляем localStorage: статус и счетчик
    const newLikedRecipes = { 
      ...currentLiked, 
      [recipeId]: newIsLiked,
      [`count_${recipeId}`]: newLikeCount
    };
    localStorage.setItem("likedRecipes", JSON.stringify(newLikedRecipes));
    
    // Принудительно обновляем UI
    refreshUI();
    
    try {
      if (currentIsLiked) {
        await dispatch(unlikeRecipe(recipeId));
      } else {
        await dispatch(likeRecipe(recipeId));
      }
    } catch (error) {
      // Откат
      const oldLikedRecipes = { 
        ...currentLiked, 
        [recipeId]: currentIsLiked,
        [`count_${recipeId}`]: currentLikeCount
      };
      localStorage.setItem("likedRecipes", JSON.stringify(oldLikedRecipes));
      refreshUI();
      console.error("Like/Unlike error:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  const handleSave = async (recipeId, currentIsSaved) => {
    if (!currentUserId) return;
    if (loadingStates[`save_${recipeId}`]) return;
    
    const currentSaved = getSavedRecipes();
    const currentSaveCount = currentSaved[`count_${recipeId}`] || (recipes?.find(r => r.id === recipeId)?.total_number_of_bookmarks || 0);
    const newIsSaved = !currentIsSaved;
    const newSaveCount = newIsSaved ? currentSaveCount + 1 : Math.max(currentSaveCount - 1, 0);
    
    setLoadingStates(prev => ({ ...prev, [`save_${recipeId}`]: true }));
    
    // Обновляем localStorage: статус и счетчик
    const newSavedRecipes = { 
      ...currentSaved, 
      [recipeId]: newIsSaved,
      [`count_${recipeId}`]: newSaveCount
    };
    localStorage.setItem("savedRecipes", JSON.stringify(newSavedRecipes));
    
    // Принудительно обновляем UI
    refreshUI();
    
    try {
      if (currentIsSaved) {
        await dispatch(removeSavedRecipe(currentUserId, recipeId));
      } else {
        await dispatch(saveRecipe(currentUserId, recipeId));
      }
    } catch (error) {
      // Откат
      const oldSavedRecipes = { 
        ...currentSaved, 
        [recipeId]: currentIsSaved,
        [`count_${recipeId}`]: currentSaveCount
      };
      localStorage.setItem("savedRecipes", JSON.stringify(oldSavedRecipes));
      refreshUI();
      console.error("Save/Remove error:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`save_${recipeId}`]: false }));
    }
  };

  const openQuickView = (recipe) => {
    setSelectedId(recipe.id);
    setOpen(true);
  };

  if (!recipes || recipes.length === 0) {
    return null;
  }

  const likedRecipes = getLikedRecipes();
  const savedRecipes = getSavedRecipes();

  return (
    <>
      <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => {
          const isLiked = likedRecipes[recipe.id] || false;
          const isSaved = savedRecipes[recipe.id] || false;
          const isLikeLoading = loadingStates[recipe.id] || false;
          const isSaveLoading = loadingStates[`save_${recipe.id}`] || false;
          const likeCount = likedRecipes[`count_${recipe.id}`] !== undefined 
            ? likedRecipes[`count_${recipe.id}`] 
            : (recipe.total_number_of_likes || 0);
          const saveCount = savedRecipes[`count_${recipe.id}`] !== undefined 
            ? savedRecipes[`count_${recipe.id}`] 
            : (recipe.total_number_of_bookmarks || 0);
          
          return (
            <div key={recipe.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-0 flex-1">
                    <dl>
                      <dt>
                        <div>
                          <img 
                            src={recipe.picture || "/placeholder-image.jpg"} 
                            className="object-cover w-full h-48 rounded-t-lg" 
                            alt={recipe.title}
                          />
                        </div>
                      </dt>
                      <div className="mt-4 flex justify-between md:mt-2">
                        <dt className="text-lg font-medium text-gray-900 truncate">{recipe.title}</dt>
                        <dt className="text-xs font-light border border-gray-200 p-1 rounded-lg text-gray-500 truncate ml-2">
                          by {recipe.username}
                        </dt>
                      </div>
                      <dd>
                        <div className="text-sm text-gray-600 line-clamp-2">{recipe.desc}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  {quickview ? (
                    <button
                      className="font-medium text-teal-700 hover:text-teal-900"
                      onClick={() => openQuickView(recipe)}
                    >
                      Quick View
                    </button>
                  ) : (
                    <Link to={`/recipe/${recipe.id}`} className="font-medium text-teal-700 hover:text-teal-900">
                      View detail
                    </Link>
                  )}
                </div>

                <div className="flex space-x-3 items-center">
                  <button 
                    type="button" 
                    onClick={() => handleLike(recipe.id, isLiked)} 
                    disabled={isLikeLoading}
                    className="focus:outline-none flex items-center space-x-1 group disabled:opacity-50"
                  >
                    {isLiked ? (
                      <HeartSolid className="h-5 w-5 text-red-500" aria-hidden="true" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" aria-hidden="true" />
                    )}
                    <span className="text-xs text-gray-500">{likeCount}</span>
                  </button>
                  
                  <div className="w-px h-5 bg-gray-300" />
                  
                  <button 
                    type="button" 
                    onClick={() => handleSave(recipe.id, isSaved)} 
                    disabled={isSaveLoading}
                    className="focus:outline-none flex items-center space-x-1 group disabled:opacity-50"
                  >
                    {isSaved ? (
                      <BookmarkIcon className="h-5 w-5 text-teal-500 fill-current" aria-hidden="true" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-500 transition-colors" aria-hidden="true" />
                    )}
                    <span className="text-xs text-gray-500">{saveCount}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {open && (
        <QuickView 
          open={open} 
          setOpen={setOpen} 
          id={selectedId}
          onRefresh={refreshUI}
        />
      )}
    </>
  );
}