// 导入 React 的核心 hooks
import { useEffect, useState, useCallback, useRef } from 'react'
// 导入 React Router 相关组件
import { useParams } from 'react-router-dom'

// 导入自定义组件
import Spinner from './Spinner.jsx'
// 导入自定义 hooks
import { useLanguage } from '../contexts/LanguageContext.jsx'
// 导入翻译配置
import { getTranslation, formatRuntime, formatDate } from '../config/translations.js'

// 导入 Swiper 相关组件和样式
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'

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
  const [videos, setVideos] = useState(null);         // 电影视频数据
  const [loading, setLoading] = useState(true);       // 加载状态
  const [error, setError] = useState('');             // 错误信息
  const [currentPlayingVideoId, setCurrentPlayingVideoId] = useState(null); // 当前播放的视频ID
  const [showAllVideos, setShowAllVideos] = useState(false); // 是否显示所有视频
  const playersRef = useRef({}); // 存储所有播放器实例的引用

  // 视频显示数量限制
  const MAX_VIDEOS = 6;
  const EXTENDED_MAX_VIDEOS = 24;

  // ========== 获取图片URL的辅助函数 ==========
  const getImageUrl = (path, size = 'w500') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : '/no-movie.png';
  };

  // ========== 获取视频数据的函数 ==========
  const fetchVideos = useCallback(async (movieId, language) => {
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
  }, []);

  // ========== 获取电影详情的函数 ==========
  const fetchMovieDetails = useCallback(async (movieId) => {
    try {
      setLoading(true);
      setError('');

      // 并行请求电影详情、演员信息和视频（使用动态语言）
      const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/movie/${movieId}?language=${apiLanguage}`, API_OPTIONS),
        fetch(`${API_BASE_URL}/movie/${movieId}/credits?language=${apiLanguage}`, API_OPTIONS),
        fetchVideos(movieId, apiLanguage)
      ]);

      // 检查响应是否成功
      if (!movieResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to fetch movie details');
      }

      // 解析JSON数据
      const movieData = await movieResponse.json();
      const creditsData = await creditsResponse.json();

      // 处理视频数据：优先使用当前语言，如果没有则fallback到英文
      let videoData = videosResponse;
      if (videoData.length === 0 && apiLanguage !== 'en-US') {
        videoData = await fetchVideos(movieId, 'en-US');
      }

      // 更新状态
      setMovie(movieData);
      setCredits(creditsData);
      setVideos(videoData);

    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('获取电影详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [apiLanguage, fetchVideos]); // 添加apiLanguage和fetchVideos依赖


  // ========== 副作用处理 ==========
  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
    }
  }, [id, fetchMovieDetails]); // 使用fetchMovieDetails依赖

  // 加载 YouTube IFrame API 脚本
  useEffect(() => {
    if (videos && videos.length > 0) {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          initializePlayers();
        };
      } else {
        initializePlayers();
      }
    }
  });

// 播放器状态变化处理
const onPlayerStateChange = useCallback((event, videoId) => {
  if (event.data === window.YT.PlayerState.PLAYING) {
    // 如果有其他视频在播放，暂停它
    if (currentPlayingVideoId && currentPlayingVideoId !== videoId) {
      const previousPlayer = playersRef.current[currentPlayingVideoId];
      if (previousPlayer && previousPlayer.pauseVideo) {
        previousPlayer.pauseVideo();
      }
    }
    setCurrentPlayingVideoId(videoId);
  } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
    // 如果当前视频暂停或结束，重置状态
    if (currentPlayingVideoId === videoId) {
      setCurrentPlayingVideoId(null);
    }
  }
}, [currentPlayingVideoId]);

// 初始化播放器
const initializePlayers = useCallback(() => {
  videos.forEach((video) => {
    if (!playersRef.current[video.id]) {
      playersRef.current[video.id] = new window.YT.Player(`youtube-player-${video.id}`, {
        events: {
          onStateChange: (event) => onPlayerStateChange(event, video.id),
        },
      });
    }
  });
}, [videos, onPlayerStateChange]);

// 播放当前视频并暂停其他视频
const playCurrentVideo = useCallback((swiper) => {
  const activeIndex = swiper.activeIndex;
  const currentVideo = videos[activeIndex];
  if (currentVideo) {
    // 暂停之前的视频
    if (currentPlayingVideoId && currentPlayingVideoId !== currentVideo.id) {
      const previousPlayer = playersRef.current[currentPlayingVideoId];
      if (previousPlayer && previousPlayer.pauseVideo) {
        previousPlayer.pauseVideo();
      }
    }
    // 播放当前视频
    const currentPlayer = playersRef.current[currentVideo.id];
    if (currentPlayer && currentPlayer.playVideo) {
      currentPlayer.playVideo();
    }
    setCurrentPlayingVideoId(currentVideo.id);
  }
}, [videos, currentPlayingVideoId]);

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

          {/* 电影视频 */}
          {videos && videos.length > 0 && (
            <div className="videos-section">
              <h2>{getTranslation('movieVideos', language)}</h2>
              <div className="videos-container">
                <Swiper
                  modules={[Navigation, Pagination, EffectCoverflow]}
                  effect="coverflow"
                  grabCursor={true}
                  centeredSlides={true}
                  slidesPerView="auto"
                  spaceBetween={20}
                  coverflowEffect={{
                    rotate: 30,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                  }}
                  navigation={true}
                  pagination={{ clickable: true }}
                  onSlideChange={playCurrentVideo}
                  breakpoints={{
                    320: {
                      slidesPerView: 1.2,
                      spaceBetween: 15
                    },
                    640: {
                      slidesPerView: 1.5,
                      spaceBetween: 20
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 25
                    },
                    1024: {
                      slidesPerView: "auto",
                      spaceBetween: 30
                    }
                  }}
                  className="movie-videos-swiper"
                >
                  {(showAllVideos ? videos.slice(0, EXTENDED_MAX_VIDEOS) : videos.slice(0, MAX_VIDEOS)).map((video) => (
                    <SwiperSlide key={video.id} className="video-slide">
                      <div className="video-item">
                        <iframe
                          id={`youtube-player-${video.id}`}
                          src={`https://www.youtube.com/embed/${video.key}?enablejsapi=1`}
                          title={video.name}
                          frameBorder="0"
                          allowFullScreen
                          className="video-iframe"
                        />
                        <div className="video-info">
                          <h3 className="video-title">{video.name}</h3>
                          <p className="video-type">{video.type}</p>
                          {video.published_at && (
                            <p className="video-date">
                              {new Date(video.published_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
                            </p>
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* 加载更多按钮 */}
              {videos.length > MAX_VIDEOS && (
                <div className="load-more-container">
                  <button
                    onClick={() => setShowAllVideos(!showAllVideos)}
                    className="load-more-button"
                  >
                    {showAllVideos
                      ? getTranslation('showLessVideos', language) || '较少显示'
                      : getTranslation('loadMoreVideos', language) || '加载更多'
                    }
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 当没有视频时显示提示 */}
          {videos && videos.length === 0 && (
            <div className="no-videos-section">
              <p className="no-videos-text">{getTranslation('noVideosAvailable', language)}</p>
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
