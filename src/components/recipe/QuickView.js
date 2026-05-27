import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon, HeartIcon, BookmarkIcon, ClockIcon } from "@heroicons/react/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/solid";
import { likeRecipe, unlikeRecipe, saveRecipe, removeSavedRecipe } from "../../redux/actions/recipes";

export default function QuickView({ open, setOpen, id, onRefresh }) {
  const { recipes, recommendations, detailRecipe } = useSelector((state) => state.recipes);
  const { user } = useSelector((state) => state.user);
  const currentUserId = user?.id;
  const dispatch = useDispatch();

  const recipe = recipes?.find((r) => r.id === id) || 
                  recommendations?.find((r) => r.id === id) ||
                  (detailRecipe?.id === id ? detailRecipe : null);
  
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const getLikedRecipes = () => JSON.parse(localStorage.getItem("likedRecipes")) || {};
  const getSavedRecipes = () => JSON.parse(localStorage.getItem("savedRecipes")) || {};

  // Получаем актуальные значения из localStorage
  const likedRecipes = getLikedRecipes();
  const savedRecipes = getSavedRecipes();
  
  const currentIsLiked = likedRecipes[id] || false;
  const currentIsSaved = savedRecipes[id] || false;
  const currentLikeCount = likedRecipes[`count_${id}`] !== undefined 
    ? likedRecipes[`count_${id}`] 
    : (recipe?.total_number_of_likes || 0);
  const currentSaveCount = savedRecipes[`count_${id}`] !== undefined 
    ? savedRecipes[`count_${id}`] 
    : (recipe?.total_number_of_bookmarks || 0);

  const [localIsLiked, setLocalIsLiked] = useState(currentIsLiked);
  const [localIsSaved, setLocalIsSaved] = useState(currentIsSaved);
  const [localLikesCount, setLocalLikesCount] = useState(currentLikeCount);
  const [localSavesCount, setLocalSavesCount] = useState(currentSaveCount);

  // Синхронизация с localStorage при открытии или обновлении
  useEffect(() => {
    if (open && recipe) {
      const liked = getLikedRecipes();
      const saved = getSavedRecipes();
      setLocalIsLiked(liked[id] || false);
      setLocalIsSaved(saved[id] || false);
      setLocalLikesCount(liked[`count_${id}`] !== undefined ? liked[`count_${id}`] : (recipe.total_number_of_likes || 0));
      setLocalSavesCount(saved[`count_${id}`] !== undefined ? saved[`count_${id}`] : (recipe.total_number_of_bookmarks || 0));
    }
  }, [open, recipe, id, forceUpdate]);

  if (!recipe) return null;

  const handleLike = async () => {
    if (isLikeLoading) return;
    
    const newIsLiked = !localIsLiked;
    const newLikeCount = newIsLiked ? localLikesCount + 1 : Math.max(localLikesCount - 1, 0);
    
    setIsLikeLoading(true);
    
    // Обновляем UI
    setLocalIsLiked(newIsLiked);
    setLocalLikesCount(newLikeCount);
    
    // Обновляем localStorage
    const currentLiked = getLikedRecipes();
    const newLikedRecipes = { 
      ...currentLiked, 
      [id]: newIsLiked,
      [`count_${id}`]: newLikeCount
    };
    localStorage.setItem("likedRecipes", JSON.stringify(newLikedRecipes));
    
    // Уведомляем родителя для обновления карточки
    if (onRefresh) onRefresh();
    
    try {
      if (localIsLiked) {
        await dispatch(unlikeRecipe(id));
      } else {
        await dispatch(likeRecipe(id));
      }
    } catch (error) {
      // Откат
      setLocalIsLiked(localIsLiked);
      setLocalLikesCount(localLikesCount);
      const oldLikedRecipes = { 
        ...currentLiked, 
        [id]: localIsLiked,
        [`count_${id}`]: localLikesCount
      };
      localStorage.setItem("likedRecipes", JSON.stringify(oldLikedRecipes));
      if (onRefresh) onRefresh();
      console.error("Like error:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUserId || isSaveLoading) return;
    
    const newIsSaved = !localIsSaved;
    const newSaveCount = newIsSaved ? localSavesCount + 1 : Math.max(localSavesCount - 1, 0);
    
    setIsSaveLoading(true);
    
    // Обновляем UI
    setLocalIsSaved(newIsSaved);
    setLocalSavesCount(newSaveCount);
    
    // Обновляем localStorage
    const currentSaved = getSavedRecipes();
    const newSavedRecipes = { 
      ...currentSaved, 
      [id]: newIsSaved,
      [`count_${id}`]: newSaveCount
    };
    localStorage.setItem("savedRecipes", JSON.stringify(newSavedRecipes));
    
    // Уведомляем родителя для обновления карточки
    if (onRefresh) onRefresh();
    
    try {
      if (localIsSaved) {
        await dispatch(removeSavedRecipe(currentUserId, id));
      } else {
        await dispatch(saveRecipe(currentUserId, id));
      }
    } catch (error) {
      // Откат
      setLocalIsSaved(localIsSaved);
      setLocalSavesCount(localSavesCount);
      const oldSavedRecipes = { 
        ...currentSaved, 
        [id]: localIsSaved,
        [`count_${id}`]: localSavesCount
      };
      localStorage.setItem("savedRecipes", JSON.stringify(oldSavedRecipes));
      if (onRefresh) onRefresh();
      console.error("Save error:", error);
    } finally {
      setIsSaveLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
        <div className="flex min-h-screen text-center md:block md:px-2 lg:px-4" style={{ fontSize: 0 }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="hidden fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity md:block" />
          </Transition.Child>

          <span className="hidden md:inline-block md:align-middle md:h-screen" aria-hidden="true">&#8203;</span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
            enterTo="opacity-100 translate-y-0 md:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 md:scale-100"
            leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
          >
            <div className="flex text-base text-left transform transition w-full md:inline-block md:max-w-2xl md:px-4 md:my-8 md:align-middle lg:max-w-4xl">
              <div className="w-full relative flex items-center bg-white px-4 pt-14 pb-8 overflow-hidden shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                <button
                  type="button"
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-8 lg:right-8"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                <div className="w-full grid grid-cols-1 gap-y-8 gap-x-6 items-start sm:grid-cols-12 lg:gap-x-8">
                  <div className="sm:col-span-4 lg:col-span-5">
                    <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
                      <img src={recipe.picture || "/placeholder-image.jpg"} alt={recipe.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="sm:col-span-8 lg:col-span-7">
                    <h2 className="text-2xl font-extrabold text-gray-900 sm:pr-12">{recipe.title}</h2>

                    <section aria-labelledby="information-heading" className="mt-3">
                      <h3 id="information-heading" className="sr-only">Recipe information</h3>
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-teal-600">
                        {recipe.category?.name || "Uncategorized"}
                      </span>
                      <div className="mt-6">
                        <h4 className="sr-only">Description</h4>
                        <p className="text-sm text-gray-700">{recipe.desc}</p>
                      </div>
                    </section>

                    <section aria-labelledby="options-heading" className="mt-2">
                      <div className="flex sm:flex-col1 space-x-4">
                        <button
                          type="button"
                          disabled={isSaveLoading}
                          className="group py-3 px-3 rounded-md flex items-center justify-center space-x-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-50"
                          onClick={handleSave}
                        >
                          <BookmarkIcon
                            className={`h-6 w-6 transition-colors ${localIsSaved ? "text-teal-500 fill-current" : ""}`}
                            aria-hidden="true"
                          />
                          <span className="text-sm text-gray-600">{localSavesCount}</span>
                          <p className="hidden ml-1 group-hover:block">Save</p>
                        </button>
                        <button
                          type="button"
                          disabled={isLikeLoading}
                          className="group py-3 px-3 rounded-md flex items-center justify-center space-x-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-50"
                          onClick={handleLike}
                        >
                          {localIsLiked ? (
                            <HeartSolid className="h-6 w-6 text-red-500" aria-hidden="true" />
                          ) : (
                            <HeartIcon className="h-6 w-6 transition-colors" aria-hidden="true" />
                          )}
                          <span className="text-sm text-gray-600">{localLikesCount}</span>
                          <p className="hidden ml-1 group-hover:block">Like</p>
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <div className="inline-flex items-center text-teal-600 border py-1 px-2 border-transparent bg-teal-50 rounded-md">
                          <ClockIcon className="h-8 w-8 text-teal-600 pr-1" />
                          <span className="font-medium">{recipe.cook_time}</span>
                        </div>
                        <p className="text-sm font-weight text-gray-500 truncate">by {recipe.username}</p>
                      </div>

                      <div className="mt-6">
                        <Link to={`/recipe/${id}`} className="font-medium text-teal-600 hover:text-teal-500" onClick={() => setOpen(false)}>
                          <button className="w-full bg-teal-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-cyan-500">
                            View Full Detail
                          </button>
                        </Link>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}