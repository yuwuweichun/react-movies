import { useEffect, useState, useCallback } from 'react'
// 导入自定义组件
import Search from './Search.jsx'        // 搜索输入框组件
import Spinner from './Spinner.jsx'      // 加载动画组件
import MovieCard from './MovieCard.jsx'  // 电影卡片组件
// 导入自定义 hooks
import useInfiniteScroll from '../hooks/useInfiniteScroll.js'  // 无限滚动 hook
import { useLanguage } from '../contexts/LanguageContext.jsx'  // 语言上下文 hook
// 导入第三方库
import { useDebounce } from 'react-use'             // 防抖 hook，用于优化搜索性能
// 导入数据库服务函数
import { getTrendingMovies, updateSearchCount } from '../appwrite.js'
// 导入翻译配置
import { getTranslation } from '../config/translations.js'

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

const MovieList = () => {
  // 获取语言上下文
  const { language, apiLanguage } = useLanguage()
  // ========== 状态管理 ==========
  // 防抖后的搜索词（用于实际发起 API 请求）
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  // 用户输入的搜索词（实时更新）
  const [searchTerm, setSearchTerm] = useState('');

  // 电影列表数据
  const [movieList, setMovieList] = useState([]);
  // 错误信息
  const [errorMessage, setErrorMessage] = useState('');
  // 初始加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 加载更多状态
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // 当前页码
  const [currentPage, setCurrentPage] = useState(1);
  // 是否还有更多数据
  const [hasMore, setHasMore] = useState(true);

  // 热门电影列表（从数据库获取）
  const [trendingMovies, setTrendingMovies] = useState([]);

  // 现在由于使用条件渲染，组件不会被卸载，所以不需要滚动位置恢复逻辑

  // ========== 防抖处理 ==========
  // 使用防抖技术，当用户停止输入 500ms 后才更新防抖搜索词
  // 这样可以避免用户每输入一个字符就发起一次 API 请求，提高性能
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  // ========== 获取电影数据的函数 ==========
  const fetchMovies = useCallback(async (query = '', page = 1, isLoadMore = false) => {
    // 如果是加载更多，设置加载更多状态；否则设置初始加载状态
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      // 重置状态
      setCurrentPage(1);
      setHasMore(true);
      setMovieList([]);
    }

    // 清除之前的错误信息
    setErrorMessage('');

    try {
      // 根据是否有搜索词决定使用哪个 API 端点，并添加分页参数和动态语言支持
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&language=${apiLanguage}`  // 搜索电影
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}&language=${apiLanguage}`;          // 获取热门电影

      // 发起 API 请求
      const response = await fetch(endpoint, API_OPTIONS);

      // 检查响应是否成功
      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      // 解析 JSON 数据
      const data = await response.json();

      // 检查 API 是否返回错误（某些 API 会在数据中返回错误信息）
      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        if (!isLoadMore) {
          setMovieList([]);
        }
        return;
      }

      // 更新电影列表状态
      if (isLoadMore) {
        // 加载更多：追加到现有列表
        setMovieList(prevMovies => [...prevMovies, ...(data.results || [])]);
      } else {
        // 初始加载：替换整个列表
        setMovieList(data.results || []);
      }

      // 更新分页信息
      setCurrentPage(data.page || page);
      setHasMore((data.page || page) < (data.total_pages || 0));

      // 如果有搜索词且有搜索结果，更新搜索统计到数据库
      if(query && data.results.length > 0 && !isLoadMore) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      // 捕获并处理错误
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      // 无论成功或失败，都要停止加载状态
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [apiLanguage]) // fetchMovies 的依赖

  // ========== 加载更多电影的函数 ==========
  const loadMoreMovies = useCallback(() => {
    // 如果还有更多数据且不在加载中，则加载下一页
    if (hasMore && !isLoadingMore && !isLoading) {
      const nextPage = currentPage + 1;
      fetchMovies(debouncedSearchTerm, nextPage, true);
    }
  }, [hasMore, isLoadingMore, isLoading, currentPage, debouncedSearchTerm, fetchMovies]); // 移除多余的apiLanguage依赖

  // ========== 无限滚动 Hook ==========
  const lastElementRef = useInfiniteScroll(loadMoreMovies, hasMore, isLoadingMore);

  // ========== 加载热门电影的函数 ==========
  const loadTrendingMovies = async () => {
    try {
      // 从 Appwrite 数据库获取搜索次数最多的电影
      const movies = await getTrendingMovies();
      // 更新热门电影状态
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  // ========== 副作用处理 (useEffect) ==========
  // 当防抖搜索词或语言改变时，重新获取电影数据
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm, apiLanguage, fetchMovies]); // 添加fetchMovies依赖

  // 组件挂载时加载热门电影
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // ========== 渲染组件 ==========
  return (
    <main>
      {/* 背景装饰图案 */}
      <div className="pattern"/>

      <div className="wrapper">
        {/* 页面头部区域 */}
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>{getTranslation('heroTitle', language)} <span className="text-gradient">{getTranslation('heroSubtitle', language)}</span></h1>

          {/* 搜索组件：传递搜索词和设置函数作为 props */}
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* 热门电影区域：只有当有热门电影数据时才显示 */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>{getTranslation('trendingMovies', language)}</h2>

            <ul>
              {/* 遍历热门电影列表，显示排名和海报 */}
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>  {/* 显示排名 */}
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 所有电影区域 */}
        <section className="all-movies">
          <h2>{getTranslation('allMovies', language)}</h2>

          {/* 条件渲染：根据状态显示不同内容 */}
          {isLoading ? (
            // 初始加载中：显示加载动画组件
            <Spinner />
          ) : errorMessage ? (
            // 有错误：显示错误信息
            <p className="text-red-500">{getTranslation('errorLoadingMovies', language)}</p>
          ) : (
            // 正常状态：显示电影列表
            <>
              <ul>
                {/* 遍历电影列表，为每个电影创建 MovieCard 组件 */}
                {movieList.map((movie, index) => {
                  // 为最后一个电影卡片添加无限滚动的触发引用
                  const isLastMovie = index === movieList.length - 1;
                  return (
                    <div
                      key={`${movie.id}-${index}`}
                      ref={isLastMovie ? lastElementRef : null}
                    >
                    <MovieCard movie={movie} />
                    </div>
                  );
                })}
              </ul>

              {/* 加载更多状态：复用 Spinner 组件 */}
              {isLoadingMore && (
                <div className="load-more-spinner">
                  <Spinner />
                </div>
              )}

              {/* 没有更多数据时的轻提示（可选） */}
              {!hasMore && movieList.length > 0 && (
                <div className="load-more-end">
                  <p className="text-gray-100">{getTranslation('noMoreMovies', language)}</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default MovieList
