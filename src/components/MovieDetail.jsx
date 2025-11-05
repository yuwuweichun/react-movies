// 导入 React 的核心 hooks
import { useEffect, useState, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
// 导入 React Router 相关组件
import { useParams, useNavigate } from 'react-router-dom'

// 导入自定义组件
import Spinner from './Spinner.jsx'
// 导入 shadow-review 卡片组件
import ReviewCard from './ReviewCard.jsx'
// 导入自定义 hooks
import { useLanguage } from '../contexts/LanguageContext.jsx'
import useInfiniteScroll from '../hooks/useInfiniteScroll.js'
import useMovieReviews from '../hooks/useMovieReviews.js'
// 导入API服务
import {
  getImageUrl,
  fetchMovieVideos as apiFetchMovieVideos,
  fetchMovieDetails as apiFetchMovieDetails,
  fetchMovieCredits as apiFetchMovieCredits
} from '../services/movieAPI.js'
// 导入翻译配置
import { getTranslation, formatRuntime, formatDate } from '../config/translations.js'

// 导入 Swiper 相关组件和样式
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'

const MovieDetail = ({ movieId, isModal = false }) => {
  // 获取路由参数中的电影ID，如果没有传入 movieId 则使用路由参数
  const { id: routeId } = useParams();
  const id = movieId || routeId;

  // 获取语言上下文
  const { language, apiLanguage } = useLanguage();
  const navigate = useNavigate(); // 新增

  // ========== 状态管理 ==========
  const [movie, setMovie] = useState(null);           // 电影详情数据
  const [credits, setCredits] = useState(null);       // 演员和制作人员信息
  const [videos, setVideos] = useState(null);         // 电影视频数据
  const [loading, setLoading] = useState(true);       // 加载状态
  const [error, setError] = useState('');             // 错误信息
  const [currentPlayingVideoId, setCurrentPlayingVideoId] = useState(null); // 当前播放的视频ID
  const [showAllVideos, setShowAllVideos] = useState(false); // 是否显示所有视频
  const playersRef = useRef({}); // 存储所有播放器实例的引用

  // 使用自定义hook管理影评
  const {
    reviews,
    reviewsLoading,
    hasMoreReviews,
    loadMoreReviews
  } = useMovieReviews(id, apiLanguage);

  // 视频显示数量限制
  const MAX_VIDEOS = 6;
  const EXTENDED_MAX_VIDEOS = 24;

  // ========== 获取视频数据的函数 ==========
  const fetchVideos = useCallback(async (movieId, language) => {
    try {
      return await apiFetchMovieVideos(movieId, language);
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  }, []);

  // ========== 使用无限滚动 hook ==========
  const lastReviewRef = useInfiniteScroll(loadMoreReviews, hasMoreReviews, reviewsLoading);

  // ========== 获取电影详情的函数 ==========
  const fetchMovieDetails = useCallback(async (movieId) => {
    if (!movieId) return;

    try {
      setLoading(true);
      setError('');

      // 并行请求电影详情、演员信息和视频（使用动态语言）
      const [movieData, creditsData, videosResponse] = await Promise.all([
        apiFetchMovieDetails(movieId, apiLanguage),
        apiFetchMovieCredits(movieId, apiLanguage),
        fetchVideos(movieId, apiLanguage)
      ]);

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

  // ========== 影评初始化加载 ==========
  // 使用 useMovieReviews hook 时，数据获取是自动的，不需要手动设置useEffect

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
            <button
              onClick={() => navigate(-1)}
              className="back-button"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {/* 左箭头SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
            <button
              onClick={() => navigate(-1)}
              className="back-button"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {getTranslation('backToMovies', language)}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={isModal ? 'movie-detail-modal' : ''}>
      {/* 背景装饰图案 - 只在非模态框模式下显示 */}
      {!isModal && <div className="pattern"/>}

      <div className={isModal ? 'movie-detail-modal-content' : 'wrapper'}>
        {/* 返回按钮 - 只在非模态框模式下显示 */}
        {!isModal && (
          <div className="back-button-container">
            <button
              onClick={() => navigate(-1)}
              className="back-button"
              title={getTranslation('backToMovies', language)}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {getTranslation('backToMovies', language)}
            </button>
          </div>
        )}

        {/* 电影详情头部区域 */}
        <section className="movie-detail-header">
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
                  <h1
                  className="movie-title"
                  style={{ marginInline: 0, maxWidth: 'none', textAlign: 'left' }}
                  >
                  {movie.title}
                  </h1>
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

          {/* 影评区域 */}
          <div className="reviews-section">
            <h2>{getTranslation('movieReviews', language)}</h2>
            {/* 显示已加载的影评 */}
            {reviews.length > 0 && (
              <div className="reviews-list">
                {reviews.map((review, index) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    language={language}
                    ref={index === reviews.length - 1 ? lastReviewRef : null}
                  />
                ))}
              </div>
            )}

            {/* 加载状态显示 */}
            {reviewsLoading && (
              <div className="loading-container">
                <Spinner />
                <p className="text-gray-100 mt-4">
                  {reviews.length > 0 ? getTranslation('loadingReviews', language) : getTranslation('loadingMovieDetails', language)}
                </p>
              </div>
            )}

            {/* 当没有影评时显示提示 */}
            {reviews.length === 0 && !reviewsLoading && (
              <div className="no-reviews-section">
                <p>{getTranslation('noReviewsAvailable', language)}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

MovieDetail.propTypes = {
  movieId: PropTypes.number,
  isModal: PropTypes.bool
};

export default MovieDetail;
