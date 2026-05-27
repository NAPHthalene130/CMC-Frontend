import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const hasPermission = (permission) => {
  if (!permission) return true
  const role = localStorage.getItem('role') || ''
  if (role === 'ADMIN') return true
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')
  return permissions.includes(permission)
}

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
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Forbidden.vue'),
    meta: { title: '无权限', requiresAuth: true }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
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
        meta: { title: '起草合同', permission: 'C_DRAFT' }
      },
      {
        path: 'contract/pending-countersign',
        name: 'PendingCountersign',
        component: () => import('@/views/contract/Countersign.vue'),
        meta: { title: '待会签合同', permission: 'P_COUNTER' }
      },
      {
        path: 'contract/pending-finalize',
        name: 'PendingFinalize',
        component: () => import('@/views/contract/Finalize.vue'),
        meta: { title: '待定稿合同', permission: 'C_FINAL' }
      },
      {
        path: 'contract/pending-approve',
        name: 'PendingApprove',
        component: () => import('@/views/contract/Approve.vue'),
        meta: { title: '待审批合同', permission: 'P_APPROVE' }
      },
      {
        path: 'contract/pending-sign',
        name: 'PendingSign',
        component: () => import('@/views/contract/Sign.vue'),
        meta: { title: '待签订合同', permission: 'P_SIGN' }
      },
      // 查询统计
      {
        path: 'query/contract',
        name: 'ContractQuery',
        component: () => import('@/views/query/ContractQuery.vue'),
        meta: { title: '合同信息查询', permission: 'C_QUERY' }
      },
      {
        path: 'query/process',
        name: 'ProcessQuery',
        component: () => import('@/views/query/ProcessQuery.vue'),
        meta: { title: '合同流程查询', permission: 'P_QUERY' }
      },
      // 客户管理
      {
        path: 'customer',
        name: 'CustomerList',
        component: () => import('@/views/customer/CustomerList.vue'),
        meta: { title: '客户管理', permission: 'CU_MANAGE' }
      },
      // 系统管理
      {
        path: 'system/users',
        name: 'UserList',
        component: () => import('@/views/system/UserList.vue'),
        meta: { title: '用户管理', permission: 'U_MANAGE' }
      },
      {
        path: 'system/roles',
        name: 'RoleList',
        component: () => import('@/views/system/RoleList.vue'),
        meta: { title: '角色管理', permission: 'R_MANAGE' }
      },
      {
        path: 'system/permissions',
        name: 'PermissionAssign',
        component: () => import('@/views/system/PermissionAssign.vue'),
        meta: { title: '分配权限', permission: 'U_MANAGE' }
      },
      {
        path: 'system/assign',
        name: 'AssignContract',
        component: () => import('@/views/system/AssignContract.vue'),
        meta: { title: '分配合同', permission: 'P_ASSIGN' }
      },
      {
        path: 'system/logs',
        name: 'LogList',
        component: () => import('@/views/system/LogList.vue'),
        meta: { title: '日志管理', permission: 'L_MANAGE' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 合同管理系统` : '合同管理系统'
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    ElMessage.warning('请先登录')
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/home')
  } else if (!hasPermission(to.meta.permission)) {
    next('/403')
  } else {
    next()
  }
})

export default router
