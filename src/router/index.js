import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/WorkspaceLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
      },
      // 合同管理
      {
        path: 'contract/draft',
        name: 'ContractDraft',
        component: () => import('@/views/contract/Draft.vue'),
        meta: { title: '起草合同' }
      },
      {
        path: 'contract/my',
        name: 'MyContracts',
        component: () => import('@/views/contract/MyContracts.vue'),
        meta: { title: '我的合同' }
      },
      {
        path: 'contract/pending-countersign',
        name: 'PendingCountersign',
        component: () => import('@/views/contract/Countersign.vue'),
        meta: { title: '待会签合同' }
      },
      {
        path: 'contract/pending-finalize',
        name: 'PendingFinalize',
        component: () => import('@/views/contract/Finalize.vue'),
        meta: { title: '待定稿合同' }
      },
      {
        path: 'contract/pending-approve',
        name: 'PendingApprove',
        component: () => import('@/views/contract/Approve.vue'),
        meta: { title: '待审批合同' }
      },
      {
        path: 'contract/pending-sign',
        name: 'PendingSign',
        component: () => import('@/views/contract/Sign.vue'),
        meta: { title: '待签订合同' }
      },
      // 查询统计
      {
        path: 'query/contract',
        name: 'ContractQuery',
        component: () => import('@/views/query/ContractQuery.vue'),
        meta: { title: '合同信息查询' }
      },
      {
        path: 'query/process',
        name: 'ProcessQuery',
        component: () => import('@/views/query/ProcessQuery.vue'),
        meta: { title: '合同流程查询' }
      },
      // 客户管理
      {
        path: 'customer',
        name: 'CustomerList',
        component: () => import('@/views/customer/CustomerList.vue'),
        meta: { title: '客户管理' }
      },
      // 系统管理
      {
        path: 'system/users',
        name: 'UserList',
        component: () => import('@/views/system/UserList.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'system/roles',
        name: 'RoleList',
        component: () => import('@/views/system/RoleList.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'system/permissions',
        name: 'PermissionAssign',
        component: () => import('@/views/system/PermissionAssign.vue'),
        meta: { title: '分配权限' }
      },
      {
        path: 'system/assign',
        name: 'AssignContract',
        component: () => import('@/views/system/AssignContract.vue'),
        meta: { title: '分配合同' }
      },
      {
        path: 'query/workflow',
        name: 'WorkflowView',
        component: () => import('@/views/query/WorkflowView.vue'),
        meta: { title: '流程可视化' }
      },
      {
        path: 'contract/versions',
        name: 'VersionHistory',
        component: () => import('@/views/contract/VersionHistory.vue'),
        meta: { title: '版本历史' }
      },
      {
        path: 'system/templates',
        name: 'TemplateList',
        component: () => import('@/views/system/TemplateList.vue'),
        meta: { title: '模板管理' }
      },
      {
        path: 'system/logs',
        name: 'LogList',
        component: () => import('@/views/system/LogList.vue'),
        meta: { title: '日志管理' }
      }
    ]
  },
  // 404 兜底
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let authWarningShown = false

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 合同管理系统` : '合同管理系统'
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    if (!authWarningShown) {
      authWarningShown = true
      ElMessage.warning('请先登录')
    }
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    authWarningShown = false
    next('/home')
  } else {
    authWarningShown = false
    next()
  }
})

export default router
