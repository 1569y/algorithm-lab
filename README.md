# Algorithm Lab · v0.3

交互式算法实验室，纯静态网站，支持本地双击打开与 GitHub Pages 部署。

## 本地运行

打开根目录 `index.html`，点击 LeetCode 1047 卡片进入模拟器。所有页面均显式链接到 `index.html`，避免本地 `file://` 打开目录索引。

## 结构

- `index.html`：可搜索、筛选的算法目录
- `assets/theme.css`：共享字体、配色和基础交互样式
- `simulators/lc1047/index.html`：栈模拟器，包含逐步执行、自动播放、Python 代码高亮

## v0.3 视觉规范

- 首页最大内容宽度 1440px；模拟器 1480px
- 白底、浅灰边框、低饱和薄荷绿强调
- 正文优先系统无衬线；代码优先 Cascadia Code / JetBrains Mono，未安装时自动回退 Consolas 等
- 宽屏双栏，小屏单栏

## 部署

上传整个项目内容到 GitHub 仓库根目录，在 Settings → Pages 选择 Deploy from a branch / main / root。不要只上传单个 HTML，否则共享 CSS 和子页面无法正常访问。

## v0.3 纵向间距调整

仅收紧 LC1047 模拟器左侧输入序列、栈、操作说明、控制区之间的空白；不改变功能、首页、双栏宽度及字体。
