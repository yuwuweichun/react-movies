import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
// 导入自定义组件
import MovieList from './components/MovieList.jsx'  // 电影列表组件
import MovieDetail from './components/MovieDetail.jsx'  // 电影详情组件
import LanguageToggle from './components/LanguageToggle.jsx'  // 语言切换组件
// 导入上下文
import { LanguageProvider } from './contexts/LanguageContext.jsx'

// ========== 路由内容组件 ==========
const AppRoutes = () => {
  const location = useLocation();

  // 检查是否在电影详情页
  const isMovieDetailPage = location.pathname.startsWith('/movie/');

  return (
    <>
      <Routes>
        {/* 首页路由：显示电影列表 */}
        <Route path="/" element={<MovieList />} />
        {/* 电影详情页路由 */}
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>

      {/* 语言切换按钮 - 只在非详情页显示 */}
      {!isMovieDetailPage && <LanguageToggle />}
    </>
  );
};

// ========== 主应用组件 ==========
const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <AppRoutes />
      </Router>
    </LanguageProvider>
  )
}

export default App
