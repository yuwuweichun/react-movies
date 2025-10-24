// 导入 Appwrite SDK 的核心模块
import { Client, Databases, ID, Query } from 'appwrite'

// 从环境变量中获取 Appwrite 配置信息
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;       // 项目 ID
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;     // 数据库 ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID; // 集合 ID

// 创建 Appwrite 客户端实例
const client = new Client()
  .setEndpoint('https://sfo.cloud.appwrite.io/v1')  // 设置 API 端点
  .setProject(PROJECT_ID)                           // 设置项目 ID

// 创建数据库实例
const database = new Databases(client);

// 更新搜索次数的函数：记录用户搜索的电影，用于生成热门电影列表
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // 1. 检查数据库中是否已存在该搜索词
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),  // 查找匹配的搜索词
    ])

    // 2. 如果搜索词已存在，增加搜索次数
    if(result.documents.length > 0) {
      const doc = result.documents[0];  // 获取第一个匹配的文档

      // 更新文档，将搜索次数加 1
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      })
    // 3. 如果搜索词不存在，创建新文档记录
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,                                                                    // 搜索词
        count: 1,                                                                     // 初始搜索次数为 1
        movie_id: movie.id,                                                          // 电影 ID
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,          // 电影海报 URL
      })
    }
  } catch (error) {
    console.error(error);  // 记录错误但不影响主应用功能
  }
}

// 获取热门电影的函数：从数据库中获取搜索次数最多的前 5 部电影
export const getTrendingMovies = async () => {
  try {
    // 查询数据库，按搜索次数降序排列，限制返回 5 条记录
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),              // 限制返回 5 条记录
      Query.orderDesc("count")     // 按 count 字段降序排列（搜索次数最多的在前）
    ])

    return result.documents;  // 返回文档数组
  } catch (error) {
    console.error(error);  // 记录错误但不影响主应用功能
    return [];  // 返回空数组，确保函数始终返回数组
  }
}
