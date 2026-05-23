import Category from "./Category";
import Ingredients from "./Ingredients";
import Procedure from "./Procedure";
import TimePicker from "./TimePicker";
import PictureUpload from "./PictureUpload";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function RecipeForm(props) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { category, ingredients, procedures, cook_time, picture } = useSelector(
    (state) => state.forms
  );

  // Берём состояние загрузки из Redux
  const { is_loading } = useSelector((state) => state.recipes);

  // Инициализация формы при редактировании (заполняем поля текущими значениями)
  useEffect(() => {
    if (props.editMode && props.recipe && props.recipe[0]) {
      setTitle(props.recipe[0].title || "");
      setDesc(props.recipe[0].desc || "");
    }
  }, [props.editMode, props.recipe]);

  // Сбрасываем isSubmitting, когда загрузка закончилась
  useEffect(() => {
    if (!is_loading && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [is_loading, isSubmitting]);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    const formData = new FormData();

    // Категория
    formData.append("category.name", category);

    // Картинка (только если есть и это файл)
    if (picture && picture instanceof File) {
      formData.append("picture", picture);
    }

    // Остальные поля
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("cook_time", cook_time);
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("procedure", JSON.stringify(procedures));

    props.handleFormSubmit(formData);
  };

  // Если режим редактирования, но рецепта ещё нет — показываем загрузку
  if (props.editMode && (!props.recipe || props.recipe.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="p-5 text-lg font-medium leading-6 text-gray-900">
                {props.editMode
                  ? "Edit your recipe"
                  : "Create your recipe and share it to the world!"}
              </h3>
              <p className="px-5 text-sm text-gray-600">
                "Cooking is like painting or writing a song. Just as there are
                only so many notes or colors, there are only so many flavors—it’s
                how you combine them that sets you apart."
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleFormSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div>
                    <h1 className="text-lg leading-6 font-medium text-gray-900">
                      Title
                    </h1>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="shadow-sm p-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500 mt-1 block w-full border border-gray-300 rounded-md"
                      placeholder="Write a title for your recipe. Something catchy ..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <h1 className="text-lg leading-6 font-medium text-gray-900">
                      Description
                    </h1>
                    <div className="mt-1">
                      <textarea
                        id="desc"
                        name="desc"
                        rows={3}
                        className="shadow-sm p-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Write a short description..."
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Write a short and precise description about your recipe.
                    </p>
                  </div>
                  <Category editMode={props.editMode} recipe={props.recipe} />
                  <Ingredients
                    editMode={props.editMode}
                    recipe={props.recipe}
                  />
                  <Procedure editMode={props.editMode} recipe={props.recipe} />
                  <TimePicker editMode={props.editMode} recipe={props.recipe} />
                  <PictureUpload />
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || is_loading}
                    className={`w-full bg-teal-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-cyan-500 ${
                      isSubmitting || is_loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting || is_loading ? "Saving..." : props.buttonLabel}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}