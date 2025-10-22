// 导入 React 的核心 hooks
import { useEffect, useState, useCallback } from 'react'
// 导入 React Router 相关组件
import { useParams } from 'react-router-dom'

// 导入自定义组件
import Spinner from './Spinner.jsx'
// 导入自定义 hooks
import { useLanguage } from '../contexts/LanguageContext.jsx'
// 导入翻译配置
import { getTranslation, formatRuntime, formatDate } from '../config/translations.js'

// TMDB (The Movie Database) API 的基础 URL
const API_BASE_URL = 'https://api.themoviedb.org/3';

// 从环境变量中获取 API 密钥
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// API 请求的配置选项
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`  // 使用 Bearer token 进行身份验证
  }
}

const MovieDetail = () => {
  // 获取路由参数中的电影ID
  const { id } = useParams();
  // 获取语言上下文
  const { language, apiLanguage } = useLanguage();
  
  // ========== 状态管理 ==========
  const [movie, setMovie] = useState(null);           // 电影详情数据
  const [credits, setCredits] = useState(null);       // 演员和制作人员信息
  const [loading, setLoading] = useState(true);       // 加载状态
  const [error, setError] = useState('');             // 错误信息

  // ========== 获取图片URL的辅助函数 ==========
  const getImageUrl = (path, size = 'w500') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : '/no-movie.png';
  };

  // ========== 获取电影详情的函数 ==========
  const fetchMovieDetails = useCallback(async (movieId) => {
    try {
      setLoading(true);
      setError('');

      // 并行请求电影详情、演员信息（使用动态语言）
      const [movieResponse, creditsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/movie/${movieId}?language=${apiLanguage}`, API_OPTIONS),
        fetch(`${API_BASE_URL}/movie/${movieId}/credits?language=${apiLanguage}`, API_OPTIONS)
      ]);

      // 检查响应是否成功
      if (!movieResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to fetch movie details');
      }

      // 解析JSON数据
      const movieData = await movieResponse.json();
      const creditsData = await creditsResponse.json();

      // 更新状态
      setMovie(movieData);
      setCredits(creditsData);

    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('获取电影详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [apiLanguage]); // 添加apiLanguage依赖


  // ========== 副作用处理 ==========
  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
    }
  }, [id, fetchMovieDetails]); // 使用fetchMovieDetails依赖

  // ========== 渲染加载状态 ==========
  if (loading) {
    return (
      <main>
        <div className="pattern"/>
        <div className="wrapper">
          <div className="loading-container">
            <Spinner />
            <p className="text-gray-100 mt-4">{getTranslation('loadingMovieDetails', language)}</p>
          </div>
        </div>
      </main>
    );
  }

  // ========== 渲染错误状态 ==========
  if (error) {
    return (
      <main>
        <div className="pattern"/>
        <div className="wrapper">
          <div className="error-container">
            <h2 className="text-red-500">{getTranslation('error', language)}</h2>
            <p className="text-gray-100">{getTranslation('errorLoadingDetails', language)}</p>
            <button onClick={() => window.close()} className="back-button">
              {getTranslation('backToMovies', language)}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ========== 渲染电影详情 ==========
  if (!movie) {
    return (
      <main>
        <div className="pattern"/>
        <div className="wrapper">
          <div className="error-container">
            <h2>{getTranslation('movieNotFound', language)}</h2>
            <button onClick={() => window.close()} className="back-button">
              {getTranslation('backToMovies', language)}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* 背景装饰图案 */}
      <div className="pattern"/>

      <div className="wrapper">
        {/* 返回按钮 */}
        <div className="back-button-container">
          <button
            onClick={() => window.close()}
            className="back-button"
            title="关闭此标签页"
          >
            ✕ {getTranslation('backToMovies', language)}
          </button>
        </div>

        {/* 电影详情头部区域 */}
        <section className="movie-detail-header">
          {/* 背景图片 */}
          <div 
            className="movie-backdrop"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${getImageUrl(movie.backdrop_path, 'w1280')})`
            }}
          />

          <div className="movie-info-overlay">
            <div className="movie-poster-container">
              <img 
                src={getImageUrl(movie.poster_path, 'w500')} 
                alt={movie.title}
                className="movie-poster"
              />
            </div>

            <div className="movie-basic-info">
              <h1 className="movie-title">{movie.title}</h1>
              {movie.tagline && (
                <p className="movie-tagline">&ldquo;{movie.tagline}&rdquo;</p>
              )}

              <div className="movie-meta">
                <div className="rating">
                  <img src="/star.svg" alt="Star Icon" />
                  <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                  <span className="vote-count">({movie.vote_count} {getTranslation('voteCount', language)})</span>
                </div>

                <div className="meta-details">
                  <span>{formatDate(movie.release_date, language)}</span>
                  <span>•</span>
                  <span>{formatRuntime(movie.runtime, language)}</span>
                  {movie.genres && movie.genres.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{movie.genres.map(genre => genre.name).join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 电影详情内容区域 */}
        <section className="movie-detail-content">
          {/* 电影简介 */}
          {movie.overview && (
            <div className="overview-section">
              <h2>{getTranslation('movieOverview', language)}</h2>
              <p className="movie-overview">{movie.overview}</p>
            </div>
          )}

          {/* 制作信息 */}
          <div className="production-info">
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="production-section">
                <h3>{getTranslation('productionCompanies', language)}</h3>
                <div className="production-companies">
                  {movie.production_companies.slice(0, 3).map(company => (
                    <span key={company.id} className="company-tag">
                      {company.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.production_countries && movie.production_countries.length > 0 && (
              <div className="production-section">
                <h3>{getTranslation('productionCountries', language)}</h3>
                <span className="production-text">{movie.production_countries.map(country => country.name).join(', ')}</span>
              </div>
            )}

            {movie.spoken_languages && movie.spoken_languages.length > 0 && (
              <div className="production-section">
                <h3>{getTranslation('spokenLanguages', language)}</h3>
                <span className="production-text">{movie.spoken_languages.map(lang => lang.name).join(', ')}</span>
              </div>
            )}
          </div>

          {/* 演员信息 */}
          {credits && credits.cast && credits.cast.length > 0 && (
            <div className="cast-section">
              <h2>{getTranslation('mainCast', language)}</h2>
              <div className="cast-list">
                {credits.cast.slice(0, 6).map(actor => (
                  <div key={actor.id} className="cast-member">
                    <img 
                      src={getImageUrl(actor.profile_path, 'w185')} 
                      alt={actor.name}
                      className="cast-photo"
                    />
                    <div className="cast-info">
                      <h4>{actor.name}</h4>
                      <p>{actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MovieDetail;
