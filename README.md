# Algorithm Lab · v0.4.5

交互式算法实验室，纯静态网页，可通过 GitHub Pages 部署。

## 已上线
- LC150 逆波兰表达式求值（栈 / Token 序列 + 当前运算）
- LC155 最小栈（双栈 / 自定义操作序列）
- LC20 有效的括号（栈）
- LC1047 删除字符串中的所有相邻重复项
- LC167 两数之和 II（左右双指针）
- LC15 三数之和（排序 + 固定数字 + 双指针 + 去重）

## 使用
直接打开根目录 `index.html`，或将本目录中的所有文件上传到 GitHub 仓库根目录，使用 GitHub Pages 从 main / (root) 发布。

## 目录
- `index.html` 首页和搜索分类
- `assets/theme.css` 原有共享主题
- `assets/simulator.css` 模拟器共享样式
- `assets/simulator.js` LC167 / LC15 演示逻辑
- `assets/simulator-stack.js` 括号匹配类演示逻辑（LC20 使用）
- `assets/simulator-minstack.js` 最小栈演示逻辑（LC155 使用）
- `assets/simulator-rpn.js` 逆波兰表达式演示逻辑（LC150 使用）
- `simulators/lc150/index.html` 逆波兰表达式求值模拟器
- `simulators/lc155/index.html` 最小栈模拟器
- `simulators/lc20/index.html` 有效的括号模拟器
- `simulators/lc1047/index.html` 栈模拟器
- `simulators/lc167/index.html` 双指针模拟器
- `simulators/lc15/index.html` 三数之和模拟器

## 更新已有仓库
在 GitHub 网页上传时，保留相同的目录结构。本次新增 `simulators/lc150` 子目录与 `assets/simulator-rpn.js`；替换根目录 `index.html`、`README.md`、`DESIGN.md` 与 `assets/simulator.css`；替换 `simulators/lc1047`、`simulators/lc155`、`simulators/lc20`、`simulators/lc15`、`simulators/lc167` 的 `index.html`（观察重点统一为无序列表）；并把引用 `simulator.css` 的页面版本参数改为 `?v=0.4.5`。

## 缓存版本
共享 CSS/JS 使用静态版本参数（例如 `simulator.css?v=0.4.4`），避免 GitHub Pages 更新后浏览器继续使用旧文件。只给实际改动过的资源提升版本号。不依赖后端，也不影响本地 `file://` 打开。

## v0.4.1 排版修正

统一 LC167 与 LC15 的数组可视化：下标、数字方块、指针分别占独立行，避免标记重叠或错位。

## v0.4.2 视觉规范

详见 [`DESIGN.md`](DESIGN.md)。统一外链字号、复杂度的时间/空间列表，并为 LC15 添加对应 CSDN 题解。

## v0.4.3 步骤同步与 LC20

- 新增 LC20「有效的括号」模拟器，展示左括号入栈、右括号与栈顶比较、出栈与最终判定的完整过程。
- 确立步骤规范：代码高亮、可视化状态与教学解释必须在时间顺序上一致（详见 `DESIGN.md` §6）。
- 修正 LC167 / LC15 中指针移动与代码高亮不同步的问题。
- LC1047 补充 LeetCode 原题链接。

## v0.4.4 最小栈与快捷输入

- 新增 LC155「最小栈」模拟器：用户自己构造 push / pop / top / getMin 操作序列，双栈并排可视化，操作序列与「某个操作内部的 Python 步骤」两级进度同步高亮；开始模拟前校验整条序列，空栈上的 pop / top / getMin 会被定位并阻止执行。
- LC20 增加六个括号快捷输入按钮，支持光标处插入与替换选区，不影响键盘输入。
- `DESIGN.md` 新增 §1.1「交互与可视化原则」：自主构造输入优先、有限输入空间可提供快捷输入、可视化结构可按题目设计、统一视觉语言但不强制统一内部布局、控制按钮坐标必须稳定。

## v0.4.5 逆波兰表达式求值 + 观察重点规范化

- 新增 LC150「逆波兰表达式求值」模拟器：用户用空格分隔自由输入 Token，页面分「Token 序列 / 计算栈 / 当前运算」三区展示；Token 序列单行横向滚动并自动跟随当前 Token，计算栈按整条输入的最大栈深一次性定高（栈顶在上）。遇到运算符时，右侧运算面板明确标出 num1（右操作数）与 num2（左操作数），并展示 `num2 - num1`、`int(num2 / num1)` 的完整计算式与向零截断说明。
- 提供 `+ - * /` 四个快捷运算符按钮，支持光标处插入与替换选区，并自动处理 Token 之间的空格。
- 执行前在模拟器层完整校验输入：空输入、非法 Token（含 `--12`）、运算符前操作数不足、除数为 0、最终栈中不是恰好 1 个结果，都会定位到具体 Token 并给出原因；校验失败不会启动播放。
- 六道算法（LC1047 / 167 / 15 / 20 / 155 / 150）的「观察重点」统一为 `<h3>` + 无序列表，每条只讲一个概念，详见 `DESIGN.md` §6.1。
