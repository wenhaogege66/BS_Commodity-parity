// API 配置文件
// 创建统一的 axios 实例
import axios from 'axios';

export const API_CONFIG = {
  // 使用相对路径，由 Nginx 代理转发
  BACKEND_URL: '/api',

  // Nginx 服务地址使用相对路径
  NGINX_URL: '',

  // API 超时时间(ms)
  TIMEOUT: 10000,

  // API 路径前缀
  API_PREFIX: '/api'
}

// 后端服务的 axios 实例
export const backendAxios = axios.create({
  baseURL: API_CONFIG.BACKEND_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  },
  // 允许跨域请求携带 cookie
  withCredentials: true
});

// 添加响应拦截器处理错误
backendAxios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Nginx 服务的 axios 实例
export const nginxAxios = axios.create({
  baseURL: API_CONFIG.NGINX_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加 token
const addAuthToken = (config: any) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (userInfo.token) {
    config.headers.Authorization = userInfo.token;
  }
  return config;
};

backendAxios.interceptors.request.use(addAuthToken);
nginxAxios.interceptors.request.use(addAuthToken); 