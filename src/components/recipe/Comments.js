import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TrashIcon, UserIcon } from "@heroicons/react/outline";
import { getComments, addComment, deleteComment } from "../../redux/actions/recipes";

export default function Comments({ recipeId }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  
  // Безопасное получение комментариев
  const commentsState = useSelector((state) => state.comments);
  const comments = commentsState?.comments?.[recipeId] || [];
  
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (recipeId) {
      dispatch(getComments(recipeId));
    }
  }, [dispatch, recipeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await dispatch(addComment(recipeId, newComment.trim()));
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await dispatch(deleteComment(commentId, recipeId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-teal-600" />
              </div>
            </div>
            <div className="flex-grow">
              <textarea
                rows={3}
                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500">
            <a href="/login" className="text-teal-600 hover:text-teal-700">
              Log in
            </a>{" "}
            to leave a comment
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-gray-900">
                    {comment.author_name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                {comment.is_author && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}