import PropTypes from 'prop-types'

// 电影卡片组件：显示单个电影的详细信息
const MovieCard = ({ movie:
  { id, title, vote_average, poster_path, release_date, original_language },
  onCardClick
}) => {
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(id);
    }
  };

  return (
    <div
      className="movie-card-link"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="movie-card">
        {/* 电影海报图片 */}
        <img
          src={poster_path ?
            `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}  // 如果有海报路径则显示，否则显示默认图片
          alt={title}  // 图片的替代文本
        />

        <div className="mt-4">
          {/* 电影标题 */}
          <h3>{title}</h3>

          {/* 电影详细信息 */}
          <div className="content">
          {/* 评分区域 */}
          <div className="rating">
            <img src="/star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>  {/* 评分保留一位小数，没有评分显示 N/A */}
          </div>

            <span>•</span>  {/* 分隔符 */}

            {/* 语言信息 */}
            <p className="lang">{original_language}</p>

            <span>•</span>  {/* 分隔符 */}

            {/* 上映年份 */}
            <p className="year">
              {release_date ? release_date.split('-')[0] : 'N/A'}  {/* 从日期字符串中提取年份 */}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 定义 PropTypes 来验证 props 类型，确保组件接收正确的电影数据
MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,              // 电影ID，必需（用于回调）
    title: PropTypes.string.isRequired,           // 电影标题，必需
    vote_average: PropTypes.number,               // 评分，可选
    poster_path: PropTypes.string,                // 海报路径，可选
    release_date: PropTypes.string,               // 上映日期，可选
    original_language: PropTypes.string           // 原始语言，可选
  }).isRequired,
  onCardClick: PropTypes.func                      // 点击回调函数，可选
}

export default MovieCard
