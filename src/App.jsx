import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// 导入自定义组件
import MovieList from './components/MovieList.jsx'  // 电影列表组件
import MovieDetail from './components/MovieDetail.jsx'  // 电影详情组件
import LanguageToggle from './components/LanguageToggle.jsx'  // 语言切换组件
// 导入上下文
import { LanguageProvider } from './contexts/LanguageContext.jsx'

// ========== 主应用组件 ==========
const App = () => {
  return (
    <LanguageProvider>
      <Router>
        {/* 全局语言切换按钮 */}
        <LanguageToggle />

        <Routes>
          {/* 首页路由：显示电影列表 */}
          <Route path="/" element={<MovieList />} />
          {/* 电影详情页路由 */}
          <Route path="/movie/:id" element={<MovieDetail />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
