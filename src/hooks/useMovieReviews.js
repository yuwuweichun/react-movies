import { useState, useCallback, useEffect } from 'react';
import { fetchMovieReviews } from '../services/movieAPI.js';

// 影评相关状态初始化
const initialReviewState = {
  reviews: [],
  reviewsLoading: false,
  reviewsPage: 1,
  hasMoreReviews: true,
  totalReviews: 0
};

const useMovieReviews = (movieId, apiLanguage) => {
  const [reviewState, setReviewState] = useState(initialReviewState);

  // 获取影评数据的函数
  const fetchReviews = useCallback(async (page = 1, append = false) => {
    if (!movieId) return;

    try {
      setReviewState(prev => ({ ...prev, reviewsLoading: true }));

      const data = await fetchMovieReviews(movieId, apiLanguage, page);
      const newReviews = data.results || [];

      // 更新影评数据
      setReviewState(prev => ({
        reviews: append ? [...prev.reviews, ...newReviews] : newReviews,
        reviewsLoading: false,
        hasMoreReviews: page < data.total_pages,
        totalReviews: data.total_results,
        reviewsPage: page
      }));

    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviewState(prev => ({
        ...prev,
        reviewsLoading: false,
        hasMoreReviews: false
      }));
    }
  }, [movieId, apiLanguage]);

  // 自动获取影评数据（当movieId或apiLanguage变化时）
  useEffect(() => {
    if (movieId) {
      fetchReviews(1, false);
    }
  }, [movieId, apiLanguage, fetchReviews]);

  // 加载更多影评的函数
  const loadMoreReviews = useCallback(() => {
    const { reviewsLoading, hasMoreReviews, reviewsPage } = reviewState;
    if (!reviewsLoading && hasMoreReviews) {
      fetchReviews(reviewsPage + 1, true);
    }
  }, [reviewState, fetchReviews]);

  // 重置影评状态
  const resetReviews = useCallback(() => {
    setReviewState(initialReviewState);
  }, []);

  return {
    ...reviewState,
    fetchReviews: () => fetchReviews(1, false),
    loadMoreReviews,
    resetReviews,
    fetchMoreReviews: (page, append) => fetchReviews(page, append) // 直接暴露原始函数以备需要
  };
};

export default useMovieReviews;
