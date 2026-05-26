import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { HeartIcon, BookmarkIcon } from "@heroicons/react/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/solid";
import { likeRecipe, unlikeRecipe, saveRecipe, removeSavedRecipe } from "../../redux/actions/recipes";
import { usePersistedState } from "../../hooks/usePersistedState";
import QuickView from "./QuickView";

export default function RecipeCard({ recipes, quickview }) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const currentUserId = user?.id;

  const [likedRecipes, setLikedRecipes] = usePersistedState("likedRecipes", {});
  const [savedRecipes, setSavedRecipes] = usePersistedState("savedRecipes", {});
  
  const [localLikes, setLocalLikes] = useState({});
  const [localSaves, setLocalSaves] = useState({});

  useEffect(() => {
    if (recipes && recipes.length > 0) {
      const likesMap = {};
      const savesMap = {};
      recipes.forEach(recipe => {
        likesMap[recipe.id] = recipe.total_number_of_likes || 0;
        savesMap[recipe.id] = recipe.total_number_of_bookmarks || 0;
      });
      setLocalLikes(likesMap);
      setLocalSaves(savesMap);
    }
  }, [recipes]);

  const handleLike = async (recipeId) => {
    if (loadingStates[recipeId]) return;
    
    const currentIsLiked = likedRecipes[recipeId] || false;
    const currentLikeCount = localLikes[recipeId] !== undefined ? localLikes[recipeId] : 0;
    
    setLoadingStates(prev => ({ ...prev, [recipeId]: true }));
    
    const newIsLiked = !currentIsLiked;
    const newLikeCount = newIsLiked ? currentLikeCount + 1 : Math.max(currentLikeCount - 1, 0);
    
    setLikedRecipes(prev => ({ ...prev, [recipeId]: newIsLiked }));
    setLocalLikes(prev => ({ ...prev, [recipeId]: newLikeCount }));
    
    try {
      if (currentIsLiked) {
        await dispatch(unlikeRecipe(recipeId));
      } else {
        await dispatch(likeRecipe(recipeId));
      }
    } catch (error) {
      setLikedRecipes(prev => ({ ...prev, [recipeId]: currentIsLiked }));
      setLocalLikes(prev => ({ ...prev, [recipeId]: currentLikeCount }));
      console.error("Like/Unlike error:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  const handleSave = async (recipeId) => {
    if (!currentUserId) return;
    if (loadingStates[`save_${recipeId}`]) return;
    
    const currentIsSaved = savedRecipes[recipeId] || false;
    const currentSaveCount = localSaves[recipeId] !== undefined ? localSaves[recipeId] : 0;
    
    setLoadingStates(prev => ({ ...prev, [`save_${recipeId}`]: true }));
    
    const newIsSaved = !currentIsSaved;
    const newSaveCount = newIsSaved ? currentSaveCount + 1 : Math.max(currentSaveCount - 1, 0);
    
    setSavedRecipes(prev => ({ ...prev, [recipeId]: newIsSaved }));
    setLocalSaves(prev => ({ ...prev, [recipeId]: newSaveCount }));
    
    try {
      if (currentIsSaved) {
        await dispatch(removeSavedRecipe(currentUserId, recipeId));
      } else {
        await dispatch(saveRecipe(currentUserId, recipeId));
      }
    } catch (error) {
      // Откат при ошибке
      setSavedRecipes(prev => ({ ...prev, [recipeId]: currentIsSaved }));
      setLocalSaves(prev => ({ ...prev, [recipeId]: currentSaveCount }));
      console.error("Save/Remove error:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`save_${recipeId}`]: false }));
    }
  };

  return (
    <>
      <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => {
          const isLiked = likedRecipes[recipe.id] || false;
          const isSaved = savedRecipes[recipe.id] || false;
          const isLikeLoading = loadingStates[recipe.id] || false;
          const isSaveLoading = loadingStates[`save_${recipe.id}`] || false;
          const likeCount = localLikes[recipe.id] !== undefined ? localLikes[recipe.id] : (recipe.total_number_of_likes || 0);
          const saveCount = localSaves[recipe.id] !== undefined ? localSaves[recipe.id] : (recipe.total_number_of_bookmarks || 0);
          
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
                      onClick={() => {
                        setOpen(true);
                        setId(recipe.id);
                      }}
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
                    onClick={() => handleLike(recipe.id)} 
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
                    onClick={() => handleSave(recipe.id)} 
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
      {open && <QuickView open={open} setOpen={setOpen} id={id} />}
    </>
  );
}