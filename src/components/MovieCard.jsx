import PropTypes from 'prop-types'

const MovieCard = ({ movie:
  { title, vote_average, poster_path, release_date, original_language }
}) => {
  return (
    <div className="movie-card">
      <img
        src={poster_path ?
          `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
        alt={title}
      />

      <div className="mt-4">
        <h3>{title}</h3>

        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          <span>•</span>
          <p className="lang">{original_language}</p>

          <span>•</span>
          <p className="year">
            {release_date ? release_date.split('-')[0] : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}

// 定义 PropTypes 来验证 props 类型
MovieCard.propTypes = {
  movie: PropTypes.shape({
    title: PropTypes.string.isRequired,
    vote_average: PropTypes.number,
    poster_path: PropTypes.string,
    release_date: PropTypes.string,
    original_language: PropTypes.string
  }).isRequired
}

export default MovieCard
