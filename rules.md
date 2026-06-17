# CMC-Frontend 开发规范

> 合同管理系统前端项目 · Vue 3 + Element Plus + Vite

---

## 1. 技术栈

| 类别 | 技术 | 版本 |
|---|---|---|
| 框架 | Vue 3 (Composition API) | ^3.4 |
| 构建 | Vite | ^5.2 |
| UI 库 | Element Plus | ^2.7 |
| 路由 | Vue Router | ^4.3 |
| 状态管理 | Pinia | ^2.1 |
| HTTP | Axios | ^1.7 |
| 图标 | @element-plus/icons-vue | ^2.3 |

---

## 2. UI 设计规范

> **详细规范参见：[ui-design-rules.md](./ui-design-rules.md)**

本项目的 UI 设计语言为 **青峦 (Mountain Green)**，排布方式为 **标签页工作区 (Tabbed Workspace)**。

所有前端页面、组件、样式开发必须遵循 `ui-design-rules.md` 中定义的：

- 色彩系统（主色 `#2d6a4f`、辅色 `#40916c` 等）
- 圆角规范（卡片 `10px`、标签 `20px` 胶囊）
- 阴影层级
- 字体排印（字号/字重/颜色的严格层级）
- 间距系统（4px 基准网格）
- 布局参数（顶部标签栏 56px、左侧导航 200px）
- Element Plus 主题定制方案
- 组件设计规范（按钮、表格、表单、标签、弹窗等）

**UI 开发铁律：**
1. 禁止使用内联硬编码颜色，必须使用 CSS 变量
2. 新增页面必须使用 `WorkspaceLayout` 布局组件包裹
3. 表格、表单、按钮等基础组件优先使用 Element Plus，通过主题变量统一样式
4. 所有新增页面需先在 `layout-templates.html`（项目根目录）中确认视觉一致性

---

## 3. 代码风格

### 3.1 Vue 组件

- 统一使用 `<script setup>` 语法
- 组件名使用 PascalCase（如 `ContractList.vue`）
- Props 必须声明类型和默认值
- Emits 必须显式声明

### 3.2 目录规范

```
src/
├── api/           # 接口请求模块（按业务模块拆分）
├── components/    # 公共组件
│   ├── common/    # 通用组件（按钮增强、空状态等）
│   └── business/  # 业务组件（合同卡片、流程步骤等）
├── layout/        # 布局组件
│   ├── WorkspaceLayout.vue
│   ├── BrandHeader.vue
│   ├── TabBar.vue
│   └── NavTree.vue
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
│   └── tabs.js    # 标签页状态
├── utils/         # 工具函数
│   └── request.js # Axios 封装
└── views/         # 页面视图
    ├── contract/  # 合同管理
    ├── query/     # 查询统计
    ├── customer/  # 客户管理
    └── system/    # 系统管理
```

### 3.3 命名规范

| 项目 | 规范 | 示例 |
|---|---|---|
| 组件文件 | PascalCase | `ContractDraft.vue` |
| 页面目录 | kebab-case | `contract-management/` |
| CSS 类名 | kebab-case | `.search-bar` |
| JS 变量/函数 | camelCase | `handleSubmit` |
| Pinia Store | camelCase | `useTabsStore` |
| API 函数 | camelCase | `fetchContractList` |
| 路由路径 | kebab-case | `/contract/draft` |

---

## 4. API 请求规范

### 4.1 请求封装

所有请求通过 `src/utils/request.js` 中统一的 Axios 实例发送：

- Base URL 从环境变量 `VITE_API_BASE_URL` 读取
- 请求拦截器自动附加 Token
- 响应拦截器统一处理错误码和 Message 提示
- 超时时间：15s

### 4.2 API 模块组织

```
src/api/
├── auth.js          # 登录/注册/登出
├── contract.js      # 合同 CRUD + 流程操作
├── customer.js      # 客户管理
├── user.js          # 用户管理
├── role.js          # 角色权限
└── log.js           # 操作日志
```

### 4.3 接口命名

- 查询列表：`getXxxList(params)`
- 查询详情：`getXxxDetail(id)`
- 新增：`createXxx(data)`
- 修改：`updateXxx(id, data)`
- 删除：`deleteXxx(id)`

---

## 5. 路由规范

### 5.1 路由结构

```js
/                    → 重定向到 /contract/list
/login               → 登录页
/register            → 注册页
/contract/list       → 合同列表
/contract/draft      → 起草合同
/contract/countersign → 待会签
/contract/finalize   → 待定稿
/contract/approve    → 待审批
/contract/sign       → 待签订
/query               → 查询统计
/customer            → 客户管理
/system/users        → 用户管理
/system/roles        → 角色管理
/system/logs         → 操作日志
/system/assign       → 分配合同
```

### 5.2 路由守卫

- 未登录用户访问任何页面 → 重定向到 `/login`
- 已登录用户访问 `/login` → 重定向到 `/contract/list`
- 无权限路由 → 显示 403 页面

---

## 6. 状态管理

### 6.1 Store 命名

| Store | 文件 | 用途 |
|---|---|---|
| `useAuthStore` | `auth.js` | 登录用户信息、Token |
| `useTabsStore` | `tabs.js` | 标签页状态 |
| `useContractStore` | `contract.js` | 当前操作的合同数据 |

### 6.2 使用原则

- 仅跨组件共享的状态放入 Store
- 页面内部状态使用 `ref` / `reactive`
- Store 中不存放 UI 临时状态（如弹窗 visible）

---

## 7. 测试要求

- 开发阶段：自测页面功能完整性
- 提测前：确保控制台无报错、无警告

---

## 8. 参考文档

| 文档 | 路径 |
|---|---|
| UI 设计规范 | [./ui-design-rules.md](./ui-design-rules.md) |
| 需求规格说明书 | [../full.md](../full.md) |
| 布局模板预览 | [../layout-templates.html](../layout-templates.html) |
| Element Plus | https://element-plus.org/ |
| Vue 3 | https://cn.vuejs.org/ |
