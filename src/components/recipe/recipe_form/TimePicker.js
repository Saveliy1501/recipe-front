import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCooktime } from "../../../redux/actions/forms";

export default function TimePicker({ editMode, recipe }) {
  const dispatch = useDispatch();

  // Получаем начальное значение времени из рецепта (если редактируем)
  const getInitialTime = () => {
    if (editMode && recipe && recipe[0] && recipe[0].cook_time) {
      return recipe[0].cook_time;
    }
    return "00:00:00";
  };

  const [cookTime, setCookTime] = useState(getInitialTime());

  useEffect(() => {
    dispatch(addCooktime(cookTime));
  }, [cookTime, dispatch]);

  const handleTimeChange = (e) => {
    setCookTime(e.target.value);
  };

  return (
    <div>
      <h1 className="text-lg leading-6 font-medium text-gray-900">Cook Time</h1>
      <p className="mt-1 text-sm text-gray-500">
        How long is it going to take to cook?
      </p>
      <div className="mt-1">
        <input
          type="time"
          name="cook_time"
          id="cook_time"
          value={cookTime}
          onChange={handleTimeChange}
          step="1"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        />
      </div>
    </div>
  );
}