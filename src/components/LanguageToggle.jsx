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
        <span className="language-flag">{languageInfo.flag}</span>
        <span className="language-code">{language}</span>
        <svg 
          className="toggle-icon"
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path 
            d="M8 12L4 8L8 4M12 8L4 8" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

export default LanguageToggle
