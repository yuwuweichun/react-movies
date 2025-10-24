// 导入自定义 hooks
import { useLanguage } from '../contexts/LanguageContext.jsx'

// 语言切换按钮组件
const LanguageToggle = () => {
  const { language, languageInfo, toggleLanguage } = useLanguage()

  // 直接切换语言
  const handleLanguageToggle = () => {
    toggleLanguage()
  }

  return (
    <div className="language-toggle-container">
      {/* 语言切换按钮 */}
      <button
        className="language-toggle-button"
        onClick={handleLanguageToggle}
        aria-label="切换语言"
        title={`当前语言: ${languageInfo.name} - 点击切换到${language === 'zh' ? 'English' : '中文'}`}
      >
        <svg
          className="language-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 12c0-5.5 1.8-10 4-10s4 4.5 4 10-1.8 10-4 10-4-4.5-4-10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="2,2"
          />
        </svg>
        <div className="flex items-center gap-1">
          <span className="language-flag">{languageInfo.flag}</span>
          <span className="language-code">{language}</span>
        </div>
      </button>
    </div>
  )
}

export default LanguageToggle
