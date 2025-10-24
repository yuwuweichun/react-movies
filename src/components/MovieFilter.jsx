import PropTypes from 'prop-types';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getTranslation } from '../config/translations.js';

// 筛选按钮组件 - 浮动在左上角
const FilterToggleButton = ({ isOpen, onToggle, language }) => {
  return (
    <div className="filter-toggle-container">
      <button
        className="filter-toggle-button"
        onClick={onToggle}
        aria-label="切换筛选器"
        title={isOpen ? '关闭筛选器' : '打开筛选器'}
      >
        <svg
          className={`filter-icon ${isOpen ? 'open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M3 6H21M6 12H18M9 18H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="filter-text">{getTranslation('filterBy', language)}</span>
      </button>
    </div>
  );
};

FilterToggleButton.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
};

const MovieFilter = ({
  genresList,
  selectedRegion,
  setSelectedRegion,
  selectedGenres,
  setSelectedGenres,
  selectedYear,
  setSelectedYear,
  selectedSortBy,
  setSelectedSortBy,
  applyFilters,
  resetFilters
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleGenreChange = (event) => {
    const genreId = parseInt(event.target.value);
    if (event.target.checked) {
      setSelectedGenres(prev => [...prev, genreId]);
    } else {
      setSelectedGenres(prev => prev.filter(id => id !== genreId));
    }
  };

  // Hardcoded regions for now, can be extended or fetched from API if available
  const regions = [
    { code: '', name: getTranslation('all', language) }, // 'All' or 'Any'
    { code: 'US', name: getTranslation('unitedStates', language) || 'United States' },
    { code: 'GB', name: getTranslation('unitedKingdom', language) || 'United Kingdom' },
    { code: 'CN', name: getTranslation('china', language) || 'China' },
    { code: 'JP', name: getTranslation('japan', language) || 'Japan' },
    { code: 'KR', name: getTranslation('southKorea', language) || 'South Korea' },
    { code: 'IN', name: getTranslation('india', language) || 'India' },
    { code: 'FR', name: getTranslation('france', language) || 'France' },
    { code: 'DE', name: getTranslation('germany', language) || 'Germany' },
    { code: 'IT', name: getTranslation('italy', language) || 'Italy' },
    { code: 'ES', name: getTranslation('spain', language) || 'Spain' },
    { code: 'CA', name: getTranslation('canada', language) || 'Canada' },
    { code: 'AU', name: getTranslation('australia', language) || 'Australia' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i); // Last 100 years

  // 过滤类型列表，移除“电视电影”
  const filteredGenresList = genresList.filter(genre => genre.name !== 'TV Movie');

  return (
    <>
      {/* 浮动筛选按钮 */}
      <FilterToggleButton
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        language={language}
      />

      {/* 侧边栏弹出效果 */}
      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="filter-sidebar-content">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">{getTranslation('filterBy', language)}</h3>
            <button
              className="text-white hover:text-light-100 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-bold text-white" htmlFor="region-select">{getTranslation('region', language)}:</label>
            <select
              id="region-select"
              className="w-full p-3 rounded border border-light-100/10 bg-gray-800 text-white text-base appearance-none"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regions.map(region => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-bold text-white">{getTranslation('genre', language)}:</label>
            <div className="grid grid-cols-2 gap-2 border border-light-100/10 rounded p-4 bg-gray-800">
              {filteredGenresList.map(genre => (
                <label key={genre.id} className="flex items-center mb-0 font-normal cursor-pointer text-white">
                  <input
                    type="checkbox"
                    className="mr-2"
                    value={genre.id}
                    checked={selectedGenres.includes(genre.id)}
                    onChange={handleGenreChange}
                  />
                  {genre.name}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-bold text-white" htmlFor="year-select">{getTranslation('year', language)}:</label>
            <select
              id="year-select"
              className="w-full p-3 rounded border border-light-100/10 bg-gray-800 text-white text-base appearance-none font-mono year-select-scrollbar"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">{getTranslation('all', language)}</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-bold text-white">{getTranslation('sortByRating', language) || 'Sort by Rating'}:</label>
            <div className="space-y-2">
              <label className="flex items-center text-white">
                <input
                  type="radio"
                  name="sortBy"
                  value="vote_average.desc"
                  checked={selectedSortBy === 'vote_average.desc'}
                  onChange={(e) => setSelectedSortBy(e.target.value)}
                  className="mr-2"
                />
                {getTranslation('sortDescending', language) || 'Highest Rated First'}
              </label>
              <label className="flex items-center text-white">
                <input
                  type="radio"
                  name="sortBy"
                  value=""
                  checked={selectedSortBy === ''}
                  onChange={(e) => setSelectedSortBy(e.target.value)}
                  className="mr-2"
                />
                {getTranslation('noSort', language) || 'No Sorting'}
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 p-3 rounded border-none text-base font-bold cursor-pointer transition-colors duration-200 bg-primary text-white hover:bg-primary/80" onClick={applyFilters}>{getTranslation('applyFilters', language)}</button>
            <button className="flex-1 p-3 rounded border-none text-base font-bold cursor-pointer transition-colors duration-200 bg-gray-600 text-white hover:bg-gray-500" onClick={resetFilters}>{getTranslation('resetFilters', language)}</button>
          </div>
        </div>
      </div>
    </>
  );
};

MovieFilter.propTypes = {
  genresList: PropTypes.array.isRequired,
  selectedRegion: PropTypes.string.isRequired,
  setSelectedRegion: PropTypes.func.isRequired,
  selectedGenres: PropTypes.array.isRequired,
  setSelectedGenres: PropTypes.func.isRequired,
  selectedYear: PropTypes.string.isRequired,
  setSelectedYear: PropTypes.func.isRequired,
  selectedSortBy: PropTypes.string.isRequired,
  setSelectedSortBy: PropTypes.func.isRequired,
  applyFilters: PropTypes.func.isRequired,
  resetFilters: PropTypes.func.isRequired,
};

export default MovieFilter;
