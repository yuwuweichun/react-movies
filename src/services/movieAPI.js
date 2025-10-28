// TMDB API 服务文件

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

/**
 * 获取图片URL
 * @param {string} path - 图片路径
 * @param {string} size - 图片尺寸
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (path, size = 'w500') => {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '/no-movie.png';
};

/**
 * 获取电影详情
 * @param {string|number} movieId - 电影ID
 * @param {string} language - 语言代码
 * @returns {Promise<Object>} 电影详情数据
 */
export const fetchMovieDetails = async (movieId, language) => {
  const response = await fetch(`${API_BASE_URL}/movie/${movieId}?language=${language}`, API_OPTIONS);
  if (!response.ok) {
    throw new Error('Failed to fetch movie details');
  }
  return response.json();
};

/**
 * 获取电影演员和制作人员信息
 * @param {string|number} movieId - 电影ID
 * @param {string} language - 语言代码
 * @returns {Promise<Object>} 演员和制作人员数据
 */
export const fetchMovieCredits = async (movieId, language) => {
  const response = await fetch(`${API_BASE_URL}/movie/${movieId}/credits?language=${language}`, API_OPTIONS);
  if (!response.ok) {
    throw new Error('Failed to fetch movie credits');
  }
  return response.json();
};

/**
 * 获取电影视频
 * @param {string|number} movieId - 电影ID
 * @param {string} language - 语言代码
 * @returns {Promise<Array>} 视频数据数组
 */
export const fetchMovieVideos = async (movieId, language) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}/videos?language=${language}`, API_OPTIONS);
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

/**
 * 获取电影影评
 * @param {string|number} movieId - 电影ID
 * @param {string} language - 语言代码
 * @param {number} page - 页码
 * @returns {Promise<Object>} 包含影评数据的对象
 */
export const fetchMovieReviews = async (movieId, language, page = 1) => {
  const response = await fetch(
    `${API_BASE_URL}/movie/${movieId}/reviews?language=${language}&page=${page}`,
    API_OPTIONS
  );

  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }

  return response.json();
};
