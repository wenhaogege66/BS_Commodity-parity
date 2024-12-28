// API 配置文件
// 创建统一的 axios 实例
import axios from 'axios';

// 环境配置
const ENV = {
  DEV: 'development',
  PROD: 'production'
};

// 当前环境，可以通过环境变量设置
const currentEnv = process.env.REACT_APP_ENV || ENV.DEV;

// API配置
const API_CONFIGS = {
  [ENV.DEV]: {
    BASE_URL: 'http://localhost:8000',
    NGINX_URL: 'http://localhost',
    SEARCH_URL: 'http://localhost:8000'
  },
  [ENV.PROD]: {
    BASE_URL: 'http://121.36.199.66',
    NGINX_URL: 'http://121.36.199.66',
    SEARCH_URL: 'http://121.36.199.66:80'
  }
};

// 导出当前环境的配置
export const API_CONFIG = API_CONFIGS[currentEnv];

// 创建axios实例
export const backendAxios = axios.create({
  baseURL: API_CONFIG.BASE_URL + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
backendAxios.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
backendAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效
      localStorage.removeItem('userInfo');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Nginx 服务的 axios 实例
export const nginxAxios = axios.create({
  baseURL: API_CONFIG.NGINX_URL,
  timeout: 10000,
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