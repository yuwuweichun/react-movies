// 影评卡片组件
import React, { useState } from 'react'
import PropTypes from 'prop-types';
import { getTranslation, formatDate } from '../config/translations.js'

// 使用 forwardRef 来支持无限滚动的 ref 传递
const ReviewCard = React.forwardRef(({ review, language }, ref) => {
  // 控制影评内容是否展开的状态
  const [isExpanded, setIsExpanded] = useState(false);

  const { author, author_details, content, created_at } = review;

  // 内容缩短的最大长度
  const maxLength = 300;
  const shouldShowReadMore = content.length > maxLength;
  const displayContent = isExpanded || !shouldShowReadMore
    ? content
    : content.substring(0, maxLength) + '...';

  // 处理头像URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    // TMDB 头像路径可能以 /https:// 开头，需要处理
    return avatarPath.startsWith('/https://')
      ? avatarPath.substring(1)
      : `https://image.tmdb.org/t/p/w185${avatarPath}`;
  };

  // 生成头像占位符
  const getFallbackAvatar = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="review-card" ref={ref}>
      {/* 左侧头像区域 */}
      <div className="review-avatar">
        {getAvatarUrl(author_details?.avatar_path) ? (
          <img
            src={getAvatarUrl(author_details.avatar_path)}
            alt={author_details?.name || author}
          />
        ) : (
          <div className="avatar-placeholder">
            {getFallbackAvatar(author_details?.name || author)}
          </div>
        )}
      </div>

      {/* 右侧内容区域 */}
      <div className="review-content">
        <div className="review-header">
          {/* 作者姓名 */}
          <h4 className="review-author">{author_details?.name || author}</h4>

          {/* 用户评分（如果存在） */}
          {author_details?.rating && (
            <div className="review-rating">
              <img src="/star.svg" alt="Rating" />
              <span>{author_details.rating}/10</span>
            </div>
          )}

          {/* 发布时间 */}
          <span className="review-date">
            {formatDate(created_at, language)}
          </span>
        </div>

        {/* 影评内容 */}
        <div className="review-text">
          {displayContent}
          {shouldShowReadMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="read-more-btn"
            >
              {isExpanded ? getTranslation('showLess', language) : getTranslation('readMore', language)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// 设置组件显示名称
ReviewCard.displayName = 'ReviewCard';

// PropTypes 验证
ReviewCard.propTypes = {
  review: PropTypes.shape({
    author: PropTypes.string.isRequired,
    author_details: PropTypes.shape({
      avatar_path: PropTypes.string,
      name: PropTypes.string,
      rating: PropTypes.number
    }),
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired
  }).isRequired,
  language: PropTypes.string.isRequired
};

export default ReviewCard;
