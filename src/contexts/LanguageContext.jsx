// 导入 React 的核心 hooks
import { createContext, useContext, useState, useEffect } from 'react'

// 创建语言上下文
const LanguageContext = createContext()

// 支持的语言配置
export const SUPPORTED_LANGUAGES = {
  zh: {
    code: 'zh-CN',
    name: '中文',
    flag: '🇨🇳'
  },
  en: {
    code: 'en-US',
    name: 'English',
    flag: '🇺🇸'
  }
}

// 语言Provider组件
export const LanguageProvider = ({ children }) => {
  // 从localStorage获取保存的语言，默认为中文
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('movie-app-language')
    return savedLanguage && SUPPORTED_LANGUAGES[savedLanguage] 
      ? savedLanguage 
      : 'zh'
  })

  // 当语言改变时，保存到localStorage
  useEffect(() => {
    localStorage.setItem('movie-app-language', language)
  }, [language])

  // 切换语言函数
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'zh' ? 'en' : 'zh')
  }

  // 设置特定语言函数
  const setLanguageCode = (langCode) => {
    if (SUPPORTED_LANGUAGES[langCode]) {
      setLanguage(langCode)
    }
  }

  // 获取当前语言的API参数
  const getApiLanguage = () => {
    return SUPPORTED_LANGUAGES[language].code
  }

  // 上下文值
  const value = {
    language,                    // 当前语言代码 (zh/en)
    languageInfo: SUPPORTED_LANGUAGES[language], // 当前语言信息
    apiLanguage: getApiLanguage(), // API请求用的语言代码
    toggleLanguage,             // 切换语言函数
    setLanguageCode,            // 设置特定语言函数
    supportedLanguages: SUPPORTED_LANGUAGES // 所有支持的语言
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// 自定义Hook：使用语言上下文
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  
  return context
}

export default LanguageContext
