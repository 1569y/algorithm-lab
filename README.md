# Algorithm Lab · v0.4.2

交互式算法实验室，纯静态网页，可通过 GitHub Pages 部署。

## 已上线
- LC1047 删除字符串中的所有相邻重复项
- LC167 两数之和 II（左右双指针）
- LC15 三数之和（排序 + 固定数字 + 双指针 + 去重）

## 使用
直接打开根目录 `index.html`，或将本目录中的所有文件上传到 GitHub 仓库根目录，使用 GitHub Pages 从 main / (root) 发布。

## 目录
- `index.html` 首页和搜索分类
- `assets/theme.css` 原有共享主题
- `assets/simulator.css` 新模拟器共享样式
- `assets/simulator.js` 新模拟器的演示逻辑
- `simulators/lc1047/index.html` 栈模拟器
- `simulators/lc167/index.html` 双指针模拟器
- `simulators/lc15/index.html` 三数之和模拟器

## 更新已有仓库
在 GitHub 网页上传时，保留相同的目录结构。上传或替换根目录 `index.html`、`README.md`，新增 `assets/simulator.css`、`assets/simulator.js`，新增两个 `simulators` 子目录。旧的 LC1047 文件无需改动。


## v0.4.1 排版修正

统一 LC167 与 LC15 的数组可视化：下标、数字方块、指针分别占独立行，避免标记重叠或错位。

## v0.4.2 视觉规范

详见 [`DESIGN.md`](DESIGN.md)。统一外链字号、复杂度的时间/空间列表，并为 LC15 添加对应 CSDN 题解。
