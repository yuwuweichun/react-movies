// 无限滚动自定义 Hook：使用 Intersection Observer API 检测元素是否进入视口
import { useRef, useEffect, useCallback } from 'react'

const useInfiniteScroll = (callback, hasMore, isLoading) => {
  // 创建观察目标的引用
  const observerRef = useRef()
  
  // 创建 Intersection Observer 的回调函数
  const lastElementRef = useCallback((node) => {
    // 如果正在加载，不添加新的观察目标
    if (isLoading) return
    
    // 如果之前的观察目标存在，先断开连接
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    // 创建新的 Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 检查目标元素是否进入视口
        if (entries[0].isIntersecting && hasMore) {
          callback() // 执行加载更多数据的回调函数
        }
      },
      {
        // 当目标元素 10% 进入视口时触发
        threshold: 0.1,
        // 提前 100px 开始加载，提升用户体验
        rootMargin: '100px'
      }
    )
    
    // 如果节点存在，开始观察
    if (node) {
      observerRef.current.observe(node)
    }
  }, [callback, hasMore, isLoading])
  
  // 组件卸载时清理观察器
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])
  
  return lastElementRef
}

export default useInfiniteScroll
