import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

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

import {
  getDetailRecipe,
  likeRecipe,
  unlikeRecipe,
  saveRecipe,
  removeSavedRecipe,
} from "../../redux/actions/recipes";
import RecipeDelete from "./RecipeDelete";

// Хук для сохранения состояния в localStorage
function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const persisted = localStorage.getItem(key);
    return persisted ? JSON.parse(persisted) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function RecipeDetail() {
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);

  const { detailRecipe } = useSelector((state) => state.recipes);
  const { user } = useSelector((state) => state.user);
  const currentUserId = user?.id;

  const { id } = useParams();

  // Персистентные состояния для лайков и сохранений
  const [likedRecipes, setLikedRecipes] = usePersistedState("likedRecipes", {});
  const [savedRecipes, setSavedRecipes] = usePersistedState("savedRecipes", {});

  // Локальные состояния для UI
  const [likesCount, setLikesCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);

  useEffect(() => {
    dispatch(getDetailRecipe(id));
  }, [dispatch, id]);

  // Когда загружается рецепт, обновляем счётчики
  useEffect(() => {
    if (detailRecipe && Object.keys(detailRecipe).length > 0) {
      setLikesCount(detailRecipe.total_number_of_likes || 0);
      setSavesCount(detailRecipe.total_number_of_bookmarks || 0);
    }
  }, [detailRecipe]);

  // Безопасный парсинг JSON
  let procedures = [];
  let ingredients = [];

  try {
    procedures = JSON.parse(detailRecipe?.procedure || "[]");
  } catch (e) {
    console.error("Failed to parse procedures:", detailRecipe?.procedure);
    procedures = [];
  }

  try {
    ingredients = JSON.parse(detailRecipe?.ingredients || "[]");
  } catch (e) {
    console.error("Failed to parse ingredients:", detailRecipe?.ingredients);
    ingredients = [];
  }

  const recipeDetails = {
    details: [
      { name: "Ingredients", items: ingredients },
      { name: "Procedures", items: procedures },
    ],
  };

  // Обработчик лайка
  const handleLike = () => {
    if (likedRecipes[id]) {
      dispatch(unlikeRecipe(id));
      setLikedRecipes(prev => ({ ...prev, [id]: false }));
      setLikesCount(prev => Math.max(prev - 1, 0));
    } else {
      dispatch(likeRecipe(id));
      setLikedRecipes(prev => ({ ...prev, [id]: true }));
      setLikesCount(prev => prev + 1);
    }
  };

  // Обработчик сохранения
  const handleSave = () => {
    if (!currentUserId) return;

    if (savedRecipes[id]) {
      dispatch(removeSavedRecipe(currentUserId, id));
      setSavedRecipes(prev => ({ ...prev, [id]: false }));
      setSavesCount(prev => Math.max(prev - 1, 0));
    } else {
      dispatch(saveRecipe(currentUserId, id));
      setSavedRecipes(prev => ({ ...prev, [id]: true }));
      setSavesCount(prev => prev + 1);
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

                  {/* Кнопки редактирования и удаления — только для автора */}
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
                    className="group py-3 px-3 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    onClick={handleSave}
                  >
                    <BookmarkIcon
                      className={`h-6 w-6 transition-colors ${
                        savedRecipes[id] ? "text-teal-500 fill-current" : ""
                      }`}
                      aria-hidden="true"
                    />
                    <p className="hidden ml-1 group-hover:block">Save</p>
                    <span className="ml-2">{savesCount}</span>
                  </button>
                  <button
                    type="button"
                    className="group py-3 px-3 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    onClick={handleLike}
                  >
                    <HeartIcon
                      className={`h-6 w-6 transition-colors ${
                        likedRecipes[id] ? "text-red-500 fill-current" : ""
                      }`}
                      aria-hidden="true"
                    />
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
              </div>
            </div>
          </div>
        </main>
      </div>
      {modal && <RecipeDelete modal={modal} setModal={setModal} id={id} />}
    </>
  );
}