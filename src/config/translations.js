// 多语言文本配置
export const translations = {
  zh: {
    // 导航和按钮
    backToMovies: '返回电影列表',
    toggleLanguage: '切换语言',
    
    // 首页文本
    heroTitle: '找到您喜欢的电影',
    heroSubtitle: '轻松享受观影乐趣',
    trendingMovies: '热门电影',
    allMovies: '所有电影',
    searchPlaceholder: '搜索电影...',
    loadingMovies: '正在加载电影...',
    noMoreMovies: '已显示所有电影',
    errorLoadingMovies: '加载电影失败，请稍后重试',
    
    // 筛选器
    filterBy: '筛选',
    region: '地区',
    genre: '类型',
    year: '年份',
    minRating: '最低评分',
    maxRating: '最高评分',
    sortByRating: '按评分排序',
    sortDescending: '评分最高优先',
    noSort: '不排序',
    applyFilters: '应用筛选',
    resetFilters: '重置筛选',
    all: '全部',
    unitedStates: '美国',
    unitedKingdom: '英国',
    china: '中国',
    japan: '日本',
    southKorea: '韩国',
    india: '印度',
    france: '法国',
    germany: '德国',
    italy: '意大利',
    spain: '西班牙',
    canada: '加拿大',
    australia: '澳大利亚',
    
    // 电影详情页
    movieOverview: '简介',
    movieVideos: '电影视频',
    noVideosAvailable: '暂无视频',
    productionCompanies: '制作公司',
    productionCountries: '制作国家',
    spokenLanguages: '语言',
    mainCast: '主要演员',
    rating: '评分',
    releaseDate: '上映日期',
    runtime: '片长',
    genres: '类型',
    voteCount: '评分人数',
    minutes: '分钟',
    hours: '小时',
    
    // 错误和加载状态
    loadingMovieDetails: '正在加载电影详情...',
    errorLoadingDetails: '获取电影详情失败，请稍后重试',
    movieNotFound: '未找到电影信息',
    error: '错误',
    loading: '加载中...',
    
    // 语言切换
    currentLanguage: '当前语言',
    switchTo: '切换到'
  },
  
  en: {
    // Navigation and buttons
    backToMovies: 'Back to Movies',
    toggleLanguage: 'Toggle Language',
    
    // Homepage text
    heroTitle: 'Find Movies You\'ll Enjoy',
    heroSubtitle: 'Without the Hassle',
    trendingMovies: 'Trending Movies',
    allMovies: 'All Movies',
    searchPlaceholder: 'Search for movies...',
    loadingMovies: 'Loading movies...',
    noMoreMovies: 'All movies displayed',
    errorLoadingMovies: 'Error loading movies. Please try again later.',
    
    // Filters
    filterBy: 'Filter By',
    region: 'Region',
    genre: 'Genre',
    year: 'Year',
    minRating: 'Min Rating',
    maxRating: 'Max Rating',
    sortByRating: 'Sort by Rating',
    sortDescending: 'Highest Rated First',
    noSort: 'No Sorting',
    applyFilters: 'Apply Filters',
    resetFilters: 'Reset Filters',
    all: 'All',
    unitedStates: 'United States',
    unitedKingdom: 'United Kingdom',
    china: 'China',
    japan: 'Japan',
    southKorea: 'South Korea',
    india: 'India',
    france: 'France',
    germany: 'Germany',
    italy: 'Italy',
    spain: 'Spain',
    canada: 'Canada',
    australia: 'Australia',
    
    // Movie detail page
    movieOverview: 'Overview',
    movieVideos: 'Movie Videos',
    noVideosAvailable: 'No videos available',
    productionCompanies: 'Production Companies',
    productionCountries: 'Production Countries',
    spokenLanguages: 'Languages',
    mainCast: 'Main Cast',
    rating: 'Rating',
    releaseDate: 'Release Date',
    runtime: 'Runtime',
    genres: 'Genres',
    voteCount: 'votes',
    minutes: 'minutes',
    hours: 'hours',
    
    // Error and loading states
    loadingMovieDetails: 'Loading movie details...',
    errorLoadingDetails: 'Failed to fetch movie details. Please try again later.',
    movieNotFound: 'Movie information not found',
    error: 'Error',
    loading: 'Loading...',
    
    // Language switching
    currentLanguage: 'Current Language',
    switchTo: 'Switch to'
  }
}

// 获取翻译文本的辅助函数
export const getTranslation = (key, language = 'zh') => {
  return translations[language]?.[key] || translations.zh[key] || key
}

// 格式化运行时间的辅助函数
export const formatRuntime = (minutes, language = 'zh') => {
  if (!minutes) return 'N/A'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (language === 'zh') {
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
  } else {
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }
}

// 格式化日期的辅助函数
export const formatDate = (dateString, language = 'zh') => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  
  if (language === 'zh') {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
