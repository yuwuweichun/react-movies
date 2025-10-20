// 导入 PropTypes 用于类型检查
import PropTypes from 'prop-types'

// 搜索组件：接收搜索词和设置函数作为 props
const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search">
      <div>
        {/* 搜索图标 */}
        <img src="search.svg" alt="search" />

        {/* 搜索输入框 */}
        <input
          type="text"
          placeholder="Search through thousands of movies"  // 占位符文本
          value={searchTerm}                               // 受控组件：值由父组件控制
          onChange={(e) => setSearchTerm(e.target.value)}  // 输入变化时调用父组件的设置函数
        />
      </div>
    </div>
  )
}

// 定义 PropTypes 来验证 props 类型，确保组件接收正确的数据类型
Search.propTypes = {
  searchTerm: PropTypes.string.isRequired,    // 搜索词必须是字符串且必需
  setSearchTerm: PropTypes.func.isRequired    // 设置函数必须是函数且必需
}

export default Search
