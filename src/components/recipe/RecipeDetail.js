import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Comments from "./Comments";

import { Disclosure } from "@headlessui/react";
import {
  HeartIcon,
  MinusSmIcon,
  PlusSmIcon,
  BookmarkIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
} from "@heroicons/react/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/solid";

import {
  getDetailRecipe,
  likeRecipe,
  unlikeRecipe,
  saveRecipe,
  removeSavedRecipe,
} from "../../redux/actions/recipes";
import RecipeDelete from "./RecipeDelete";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function RecipeDetail() {
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const { detailRecipe } = useSelector((state) => state.recipes);
  const { user } = useSelector((state) => state.user);
  const currentUserId = user?.id;

  const { id } = useParams();

  // Функции для работы с localStorage
  const getLikedRecipes = () => JSON.parse(localStorage.getItem("likedRecipes")) || {};
  const getSavedRecipes = () => JSON.parse(localStorage.getItem("savedRecipes")) || {};

  // Получаем актуальные значения из localStorage
  const likedRecipes = getLikedRecipes();
  const savedRecipes = getSavedRecipes();
  
  const [isLiked, setIsLiked] = useState(likedRecipes[id] || false);
  const [isSaved, setIsSaved] = useState(savedRecipes[id] || false);
  const [likesCount, setLikesCount] = useState(
    likedRecipes[`count_${id}`] !== undefined 
      ? likedRecipes[`count_${id}`] 
      : (detailRecipe?.total_number_of_likes || 0)
  );
  const [savesCount, setSavesCount] = useState(
    savedRecipes[`count_${id}`] !== undefined 
      ? savedRecipes[`count_${id}`] 
      : (detailRecipe?.total_number_of_bookmarks || 0)
  );

  // Функция для обновления UI
  const refreshUI = () => {
    setForceUpdate(prev => prev + 1);
  };

  // Синхронизация с localStorage при загрузке рецепта
  useEffect(() => {
    if (detailRecipe && Object.keys(detailRecipe).length > 0) {
      const liked = getLikedRecipes();
      const saved = getSavedRecipes();
      setIsLiked(liked[id] || false);
      setIsSaved(saved[id] || false);
      setLikesCount(liked[`count_${id}`] !== undefined ? liked[`count_${id}`] : (detailRecipe.total_number_of_likes || 0));
      setSavesCount(saved[`count_${id}`] !== undefined ? saved[`count_${id}`] : (detailRecipe.total_number_of_bookmarks || 0));
    }
  }, [detailRecipe, id, forceUpdate]);

  useEffect(() => {
    dispatch(getDetailRecipe(id));
  }, [dispatch, id]);

  let procedures = [];
  let ingredients = [];

  try {
    procedures = JSON.parse(detailRecipe?.procedure || "[]");
  } catch (e) {
    procedures = [];
  }

  try {
    ingredients = JSON.parse(detailRecipe?.ingredients || "[]");
  } catch (e) {
    ingredients = [];
  }

  const recipeDetails = {
    details: [
      { name: "Ingredients", items: ingredients },
      { name: "Procedures", items: procedures },
    ],
  };

  const handleLike = async () => {
    if (isLikeLoading) return;
    
    const currentIsLiked = isLiked;
    const currentLikeCount = likesCount;
    const newIsLiked = !currentIsLiked;
    const newLikeCount = newIsLiked ? currentLikeCount + 1 : Math.max(currentLikeCount - 1, 0);
    
    setIsLikeLoading(true);
    
    // Обновляем UI
    setIsLiked(newIsLiked);
    setLikesCount(newLikeCount);
    
    // Обновляем localStorage
    const currentLiked = getLikedRecipes();
    const newLikedRecipes = { 
      ...currentLiked, 
      [id]: newIsLiked,
      [`count_${id}`]: newLikeCount
    };
    localStorage.setItem("likedRecipes", JSON.stringify(newLikedRecipes));
    
    try {
      if (currentIsLiked) {
        await dispatch(unlikeRecipe(id));
      } else {
        await dispatch(likeRecipe(id));
      }
    } catch (error) {
      // Откат
      setIsLiked(currentIsLiked);
      setLikesCount(currentLikeCount);
      const oldLikedRecipes = { 
        ...currentLiked, 
        [id]: currentIsLiked,
        [`count_${id}`]: currentLikeCount
      };
      localStorage.setItem("likedRecipes", JSON.stringify(oldLikedRecipes));
      console.error("Like error:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUserId || isSaveLoading) return;
    
    const currentIsSaved = isSaved;
    const currentSaveCount = savesCount;
    const newIsSaved = !currentIsSaved;
    const newSaveCount = newIsSaved ? currentSaveCount + 1 : Math.max(currentSaveCount - 1, 0);
    
    setIsSaveLoading(true);
    
    // Обновляем UI
    setIsSaved(newIsSaved);
    setSavesCount(newSaveCount);
    
    // Обновляем localStorage
    const currentSaved = getSavedRecipes();
    const newSavedRecipes = { 
      ...currentSaved, 
      [id]: newIsSaved,
      [`count_${id}`]: newSaveCount
    };
    localStorage.setItem("savedRecipes", JSON.stringify(newSavedRecipes));
    
    try {
      if (currentIsSaved) {
        await dispatch(removeSavedRecipe(currentUserId, id));
      } else {
        await dispatch(saveRecipe(currentUserId, id));
      }
    } catch (error) {
      // Откат
      setIsSaved(currentIsSaved);
      setSavesCount(currentSaveCount);
      const oldSavedRecipes = { 
        ...currentSaved, 
        [id]: currentIsSaved,
        [`count_${id}`]: currentSaveCount
      };
      localStorage.setItem("savedRecipes", JSON.stringify(oldSavedRecipes));
      console.error("Save error:", error);
    } finally {
      setIsSaveLoading(false);
    }
  };

  if (!detailRecipe || Object.keys(detailRecipe).length === 0) {
    return (
      <div className="px-4 py-8 mx-auto text-center">
        <p className="text-3xl text-gray-700">Loading recipe...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white">
        <main className="max-w-7xl mx-auto sm:pt-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto lg:max-w-none">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
              <div className="flex flex-col-reverse">
                <div className="w-full aspect-w-1 aspect-h-1">
                  <div>
                    <img
                      src={detailRecipe.picture || "/placeholder-image.jpg"}
                      alt={detailRecipe.title}
                      className="w-full h-full object-center object-cover sm:rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                <div className="flex sm:flex-col1">
                  <h1 className="flex text-3xl font-extrabold tracking-tight text-gray-900">
                    {detailRecipe.title}
                  </h1>

                  {currentUserId === detailRecipe.author && (
                    <div className="flex">
                      <Link to={`/recipe/${id}/edit/`}>
                        <button
                          type="button"
                          className="group ml-4 py-3 px-3 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        >
                          <PencilIcon
                            className="h-5 w-5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <p className="hidden ml-1 group-hover:block">
                            Edit Recipe
                          </p>
                        </button>
                      </Link>
                      <button
                        type="button"
                        className="group ml-4 py-3 px-3 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        onClick={() => setModal(true)}
                      >
                        <TrashIcon
                          className="h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <p className="hidden ml-1 group-hover:block">
                          Delete Recipe
                        </p>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <h2 className="sr-only">Recipe information</h2>
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-teal-600">
                    {detailRecipe.category?.name || "Uncategorized"}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="sr-only">Description</h3>
                  <div
                    className="text-base text-gray-700 space-y-6"
                    dangerouslySetInnerHTML={{ __html: detailRecipe.desc }}
                  />
                </div>

                <div className="mt-2 flex sm:flex-col1">
                  <button
                    type="button"
                    disabled={isSaveLoading}
                    className="group py-3 px-3 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-50"
                    onClick={handleSave}
                  >
                    <BookmarkIcon
                      className={`h-6 w-6 transition-colors ${isSaved ? "text-teal-500 fill-current" : ""}`}
                      aria-hidden="true"
                    />
                    <p className="hidden ml-1 group-hover:block">Save</p>
                    <span className="ml-2">{savesCount}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isLikeLoading}
                    className="group py-3 px-3 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-50"
                    onClick={handleLike}
                  >
                    {isLiked ? (
                      <HeartSolid className="h-6 w-6 text-red-500" aria-hidden="true" />
                    ) : (
                      <HeartIcon className="h-6 w-6 transition-colors" aria-hidden="true" />
                    )}
                    <p className="hidden ml-1 group-hover:block">Like</p>
                    <span className="ml-2">{likesCount}</span>
                  </button>
                </div>

                <div className="inline-flex items-center text-teal-600 border py-1 px-2 mt-3 border-transparent bg-teal-50 rounded-md">
                  <ClockIcon className="h-8 w-8 text-teal-600 pr-1" />
                  <span className="font-medium">{detailRecipe.cook_time}</span>
                </div>

                <section aria-labelledby="details-heading" className="mt-12">
                  <h2 id="details-heading" className="sr-only">
                    Additional details
                  </h2>
                  <div className="border-t divide-y divide-gray-200">
                    {recipeDetails.details.map((detail) => (
                      <Disclosure as="div" key={detail.name}>
                        {({ open }) => (
                          <>
                            <h3>
                              <Disclosure.Button className="group relative w-full py-6 flex justify-between items-center text-left">
                                <span
                                  className={classNames(
                                    open ? "text-teal-600" : "text-gray-900",
                                    "text-base font-medium"
                                  )}
                                >
                                  {detail.name}
                                </span>
                                <span className="ml-6 flex items-center">
                                  {open ? (
                                    <MinusSmIcon
                                      className="block h-6 w-6 text-teal-400 group-hover:text-teal-500"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <PlusSmIcon
                                      className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel
                              as="div"
                              className="pb-6 prose prose-sm"
                            >
                              {detail.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="border-t border-gray-200"
                                >
                                  <dl>
                                    <div className="bg-gray-50 px-4 py-5 sm:px-6">
                                      <dt className="text-sm font-normal text-gray-500">
                                        {idx + 1}) {item}
                                      </dt>
                                    </div>
                                  </dl>
                                </div>
                              ))}
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    ))}
                  </div>
                </section>

                {/* КОММЕНТАРИИ - добавлено здесь */}
                <Comments recipeId={id} />
                
              </div>
            </div>
          </div>
        </main>
      </div>
      {modal && <RecipeDelete modal={modal} setModal={setModal} id={id} />}
    </>
  );
}