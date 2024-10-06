import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/login.vue'
import Dashboard from '../components/Dashboard.vue'
import Book from '../components/Book.vue'
import Card from '../components/Card.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    { path: '/user',name:"use", component: Dashboard,meta:{title:"用户"} },
    {
      path: '/dashboard/:userId?',
      component: Dashboard,
      children: [
      {
        // 当 /user/:id/profile 匹配成功
        // UserProfile 将被渲染到 User 的 <router-view> 内部
        path: '',
        component: Book,
      },
      {
        // 当 /user/:id/profile 匹配成功
        // UserProfile 将被渲染到 User 的 <router-view> 内部
        path: 'book',
        component: Book,
      },
      {
        // 当 /user/:id/posts 匹配成功
        // UserPosts 将被渲染到 User 的 <router-view> 内部
        path: 'card',
        component: Card,
      }
    ],
    },
    {
      path: '/login',
      component: Login
    },
  ]
})

export default router
