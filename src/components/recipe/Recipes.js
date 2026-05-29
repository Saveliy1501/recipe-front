import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getRecipes } from "../../redux/actions/recipes";
import RecipeCard from "./RecipeCard";

export default function Recipes() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { recipes, is_loading } = useSelector((state) => state.recipes);

  // Состояния для фильтров
  const [selectedCategory, setSelectedCategory] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorInputValue, setAuthorInputValue] = useState(""); // отдельное состояние для ввода
  const [sortBy, setSortBy] = useState("");

  // Категории
  const categories = [
    { id: "", name: "All Categories" },
    { id: "Main Dish", name: "Main Dish" },
    { id: "Dessert", name: "Dessert" },
    { id: "Appetizer", name: "Appetizer" },
  ];

  // Варианты сортировки
  const sortOptions = [
    { value: "", label: "Default" },
    { value: "-total_number_of_likes", label: "Most Liked" },
    { value: "total_number_of_likes", label: "Least Liked" },
    { value: "cook_time", label: "Fastest to Cook" },
    { value: "-cook_time", label: "Longest to Cook" },
  ];

  // Читаем параметры из URL при загрузке
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchTerm = params.get('search') || '';
    const categoryName = params.get('category__name') || '';
    const author = params.get('author__username') || '';
    const sort = params.get('ordering') || '';
    
    setSelectedCategory(categoryName);
    setAuthorInputValue(author);
    setAuthorName(author);
    setSortBy(sort);
    
    dispatch(getRecipes(searchTerm, categoryName, author, sort));
  }, [dispatch, location.search]);

  // Обработчик изменения категории - применяем сразу
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    updateURL({ 
      category__name: newCategory, 
      author__username: authorName, 
      sort: sortBy 
    });
  };

  // Обработчик изменения сортировки
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    updateURL({ 
      category__name: selectedCategory, 
      author__username: authorName, 
      sort: newSort 
    });
  };

  // Обработчик изменения поля автора - только обновляем значение в input
  const handleAuthorChange = (e) => {
    setAuthorInputValue(e.target.value);
  };

  // Поиск по автору ТОЛЬКО по Enter
  const handleAuthorKeyPress = (e) => {
    if (e.key === "Enter") {
      const newAuthor = e.target.value.trim();
      setAuthorName(newAuthor);
      updateURL({ 
        category__name: selectedCategory, 
        author__username: newAuthor, 
        sort: sortBy 
      });
    }
  };

  // Функция обновления URL
  const updateURL = (params) => {
    const urlParams = new URLSearchParams();
    
    // Сохраняем поисковый запрос из URL
    const currentSearch = new URLSearchParams(location.search).get('search');
    if (currentSearch) {
      urlParams.set('search', currentSearch);
    }
    
    // Добавляем новые параметры
    if (params.category__name) urlParams.set('category__name', params.category__name);
    if (params.author__username) urlParams.set('author__username', params.author__username);
    if (params.sort) urlParams.set('ordering', params.sort);
    
    // Удаляем пустые параметры
    if (!params.category__name) urlParams.delete('category__name');
    if (!params.author__username) urlParams.delete('author__username');
    if (!params.sort) urlParams.delete('ordering');
    
    const queryString = urlParams.toString();
    navigate(`/recipe${queryString ? `?${queryString}` : ''}`, { replace: true });
  };

  if (is_loading && !recipes) {
    return (
      <div className="px-4 py-8 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-15">
        <p className="text-3xl text-center text-gray-700">Loading recipes...</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="px-4 py-8 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-15">
        <p className="text-3xl text-center text-gray-700">
          Can not find any recipes, sorry (:
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-14">
        <div className="flex flex-col w-full mb-6 lg:justify-between lg:flex-row md:mb-8">
          <div className="flex items-center mb-5 md:mb-6 group lg:max-w-xl">
            <a href="/" aria-label="Item" className="mr-3">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50">
                <svg
                  className="w-12 h-12 text-teal-600"
                  stroke="currentColor"
                  viewBox="0 0 52 52"
                >
                  <polygon
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    points="29 13 14 29 25 29 23 39 38 23 27 23"
                  />
                </svg>
              </div>
            </a>
            <h2 className="font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl">
              <span className="inline-block mb-2">Рецепты всех пользователей</span>
              <div className="h-1 ml-auto duration-300 origin-left transform bg-teal-600 scale-x-30 group-hover:scale-x-100" />
            </h2>
          </div>
          <p className="w-full text-gray-700 lg:text-sm lg:max-w-md">
            "Cooking is not difficult. Everyone has a taste, even if they don't
            realize it. Even if you're not a great chef, there's nothing to stop
            you from understanding the difference between what tastes good and
            what doesn't."
          </p>
        </div>

        {/* Фильтры и сортировка */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Фильтр по категориям */}
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.id || "all"} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по автору - только по Enter */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter by author name... (press Enter)"
              value={authorInputValue}
              onChange={handleAuthorChange}
              onKeyPress={handleAuthorKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Сортировка */}
          <div className="w-full md:w-64">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Список рецептов */}
        {is_loading ? (
          <div className="flex justify-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <RecipeCard recipes={recipes} quickview={true} />
        )}
      </div>
    </>
  );
}