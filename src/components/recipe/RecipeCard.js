import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { HeartIcon, BookmarkIcon } from "@heroicons/react/outline";
import { likeRecipe, unlikeRecipe, saveRecipe, removeSavedRecipe } from "../../redux/actions/recipes";
import { usePersistedState } from "../../hooks/usePersistedState";
import QuickView from "./QuickView";

export default function RecipeCard({ recipes, quickview }) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const currentUserId = user?.id;

  // Персистентные состояния
  const [likedRecipes, setLikedRecipes] = usePersistedState("likedRecipes", {});
  const [savedRecipes, setSavedRecipes] = usePersistedState("savedRecipes", {});

  const handleLike = (recipeId) => {
    if (likedRecipes[recipeId]) {
      dispatch(unlikeRecipe(recipeId));
      setLikedRecipes(prev => ({ ...prev, [recipeId]: false }));
    } else {
      dispatch(likeRecipe(recipeId));
      setLikedRecipes(prev => ({ ...prev, [recipeId]: true }));
    }
  };

  const handleSave = (recipeId) => {
    if (!currentUserId) return;

    if (savedRecipes[recipeId]) {
      dispatch(removeSavedRecipe(currentUserId, recipeId));
      setSavedRecipes(prev => ({ ...prev, [recipeId]: false }));
    } else {
      dispatch(saveRecipe(currentUserId, recipeId));
      setSavedRecipes(prev => ({ ...prev, [recipeId]: true }));
    }
  };

  return (
    <>
      <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt>
                      <div>
                        <img src={recipe.picture} className="object-cover w-full h-48" alt="" />
                      </div>
                    </dt>
                    <div className="mt-4 flex justify-between md:mt-2">
                      <dt className="text-lg font-medium text-gray-500 truncate">{recipe.title}</dt>
                      <dt className="text-xs font-light border border-gray-200 p-1 rounded-lg text-gray-500 truncate">
                        by {recipe.username}
                      </dt>
                    </div>
                    <dd>
                      <div className="text-sm text-gray-900">{recipe.desc}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="flex justify-between bg-gray-50 px-5 py-3">
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

              <div className="flex space-x-2">
                <button type="button" onClick={() => handleLike(recipe.id)} className="focus:outline-none">
                  <HeartIcon
                    className={`h-6 w-6 transition-colors ${
                      likedRecipes[recipe.id] ? "text-red-500 fill-current" : "text-gray-400 hover:text-red-500"
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div className="w-px h-6 bg-gray-400" />
                <button type="button" onClick={() => handleSave(recipe.id)} className="focus:outline-none">
                  <BookmarkIcon
                    className={`h-6 w-6 transition-colors ${
                      savedRecipes[recipe.id] ? "text-teal-500 fill-current" : "text-gray-400 hover:text-teal-500"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {open && <QuickView open={open} setOpen={setOpen} id={id} />}
    </>
  );
}