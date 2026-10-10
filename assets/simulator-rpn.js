/* Algorithm Lab · LC150 逆波兰表达式求值 · v0.4.5
   严格使用作者题解中的最终 Python 实现：不更换算法、不交换 num1 / num2、
   不用 // 替代 int(a / b)、不把负数判断改成运算符集合判断、不增加原代码没有的分支。
   输入合法性检查只发生在模拟器层，原 Python 代码保持不变。

   步骤快照约定（DESIGN.md §6）：每个步骤代表「该行执行完之后」的状态，
   代码高亮、栈画面与教学解释在时间顺序上保持一致。
   每个快照都对 stack 做深拷贝，历史快照之间不共享可变数组引用。 */
const $ = id => document.getElementById(id);

/* 与页面展示的 Python 代码逐行一致（1-based 行号用于高亮） */
const CODE = [
  'class Solution:',
  '    def evalRPN(self, tokens: List[str]) -> int:',
  '        stack = []',
  '',
  '        for char in tokens:',
  '            if char.lstrip("-").isdigit():',
  '                stack.append(int(char))',
  '',
  '            else:',
  '                num1 = stack.pop()',
  '                num2 = stack.pop()',
  '',
  '                if char == "+":',
  '                    num = num1 + num2',
  '',
  '                elif char == "-":',
  '                    num = num2 - num1',
  '',
  '                elif char == "*":',
  '                    num = num1 * num2',
  '',
  '                else:',
  '                    num = int(num2 / num1)',
  '',
  '                stack.append(num)',
  '',
  '        return stack[0]'
];

const OPERATORS = ['+', '-', '*', '/'];
const MAX_TOKENS = 24;              /* 可视化限制；LeetCode 原题上限是 10⁴，但本演示不会展开成万个步骤 */
const PROBLEM_MAX_TOKENS = 10000;   /* LeetCode 150 原题：1 <= tokens.length <= 10⁴ */
const LEETCODE_TOKEN_MIN = -200, LEETCODE_TOKEN_MAX = 200;   /* 原题整数 Token 范围 */
const INT_MIN = -2147483648, INT_MAX = 2147483647;           /* 原题保证的中间结果范围 */
const DEFAULT_INPUT = '4 13 5 / +';

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
$('code').innerHTML = CODE.map((line, i) =>
  `<span class="code-line" data-line="${i + 1}">${escapeHTML(line) || ' '}</span>`).join('');

/* ---------- 数值处理 ---------- */
/* Python 的 int 没有 -0，而 JavaScript 的 -0 会显示成 "-0"（例如 Math.trunc(-0.4)）。
   这里统一归一化，避免画面上出现 -0。 */
function norm(v) { return v === 0 ? 0 : v; }

/* Python: char.lstrip("-") —— 去掉开头所有连续的 "-" */
function lstripMinus(t) { let k = 0; while (k < t.length && t[k] === '-') k++; return t.slice(k); }

/* 与作者代码 if/elif/else 完全同序的运算（不交换 num1 / num2） */
function compute(token, num1, num2) {
  let num;
  if (token === '+') num = num1 + num2;
  else if (token === '-') num = num2 - num1;
  else if (token === '*') num = num1 * num2;
  else num = Math.trunc(num2 / num1);   /* 等价于 Python 的 int(num2 / num1)：向零截断 */
  return norm(num);
}

/* ---------- 输入解析与校验（仅模拟器层，不改动算法） ---------- */
function parseInput(raw) {
  const text = String(raw).trim();
  if (!text) return { error: '请输入至少一个 Token，例如：4 13 5 / + 。输入不能为空。', tokens: [] };
  const tokens = text.split(/\s+/);
  if (tokens.length > MAX_TOKENS) {
    return {
      tokens: tokens,
      error: `本演示最多 ${MAX_TOKENS} 个 Token（当前 ${tokens.length} 个）。这是可视化长度限制，不是题目限制：LeetCode 原题允许 1 ≤ tokens.length ≤ 10⁴（${PROBLEM_MAX_TOKENS}），但本演示不会把它展开成上万个步骤。`
    };
  }
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (OPERATORS.indexOf(t) >= 0) continue;
    if (!/^-?\d+$/.test(t)) {
      const extra = /^-{2,}\d+$/.test(t)
        ? `注意：虽然 Python 里 "${t}".lstrip("-").isdigit() 会返回 True，但 int("${t}") 会抛出 ValueError —— 原题保证不会出现这种 Token，本演示因此在执行前就拒绝它。`
        : `Token 只能是整数（可带一个负号）或 + - * / 之一。`;
      return { tokens: tokens, error: `第 ${i + 1} 个 Token「${t}」不是合法 Token。${extra}` };
    }
    const v = Number(t);
    if (!Number.isSafeInteger(v) || v < INT_MIN || v > INT_MAX) {
      return { tokens: tokens, error: `第 ${i + 1} 个 Token「${t}」超出 32 位有符号整数范围（${INT_MIN} ~ ${INT_MAX}）。LeetCode 原题的整数 Token 范围是 ${LEETCODE_TOKEN_MIN} ~ ${LEETCODE_TOKEN_MAX}。` };
    }
  }
  return { tokens: tokens };
}

/* 按真实执行顺序干跑一遍，检查合法性；错误信息定位到具体 Token */
function validateRun(tokens) {
  const st = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (OPERATORS.indexOf(t) < 0) { st.push(norm(Number(t))); continue; }
    if (st.length < 2) {
      return { error: `第 ${i + 1} 个 Token「${t}」是运算符，但它前面只剩 ${st.length} 个操作数，无法连续弹出两个操作数。合法的逆波兰表达式要求每个运算符之前至少有两个待计算的值。` };
    }
    const num1 = st.pop(), num2 = st.pop();
    if (t === '/' && num1 === 0) {
      return { error: `第 ${i + 1} 个 Token 是「/」，它要除以的右操作数（num1）为 0。Python 中 num2 / 0 会抛出 ZeroDivisionError，本演示在执行前拒绝这个输入。` };
    }
    const num = compute(t, num1, num2);
    if (num < INT_MIN || num > INT_MAX) {
      return { error: `第 ${i + 1} 个 Token「${t}」的中间结果 ${num} 超出 32 位有符号整数范围。LeetCode 150 保证所有中间结果都在该范围内。` };
    }
    st.push(num);
  }
  if (st.length !== 1) {
    return { error: `所有 Token 处理完后，栈中还有 ${st.length} 个值。合法的逆波兰表达式最终应当恰好剩下 1 个结果，请检查 Token 的个数与位置。` };
  }
  return { ok: true };
}

/* ---------- 生成完整状态快照 ---------- */
function solve150(tokens) {
  const out = [];
  const stack = [];
  const snap = o => out.push(Object.assign({
    stack: stack.slice(), idx: -1, token: null, num1: null, num2: null, num: null,
    popped: [], result: null, justPushed: false
  }, o));

  snap({
    line: 3, phase: 'init',
    title: '初始化一个空栈',
    desc: 'stack = [] 。逆波兰表达式靠「运算符出现在两个操作数之后」来避免括号与优先级问题，因此只需要一个栈，按顺序处理每一个 Token。'
  });

  tokens.forEach((tk, i) => {
    const isNum = OPERATORS.indexOf(tk) < 0;

    snap({
      line: 5, phase: 'token', idx: i, token: tk,
      title: `遍历到第 ${i + 1} 个 Token「${tk}」`,
      desc: isNum
        ? `for char in tokens 取出「${tk}」。它由数字组成（可能以一个负号开头），接下来要用 char.lstrip("-").isdigit() 判断它是不是数字 Token。`
        : `for char in tokens 取出「${tk}」。它看起来像运算符，但仍要先做同样的判断，确认它不会被当成数字。`
    });

    if (isNum) {
      const v = norm(Number(tk));   /* Python 的 int("-0") 是 0，Python 的整数没有 -0 */
      snap({
        line: 6, phase: 'digit-check', idx: i, token: tk,
        title: '判断：它是数字 Token',
        desc: digitDesc(tk)
      });
      stack.push(v);
      snap({
        line: 7, phase: 'push', idx: i, token: tk, justPushed: true,
        title: `int("${tk}") 入栈 → ${v}`,
        desc: `执行 stack.append(int(char))。画面里的栈已经多出 ${v}，它现在就位于栈顶，后面出现的运算符才能取到它。`
      });
      return;
    }

    snap({
      line: 6, phase: 'digit-check', idx: i, token: tk,
      title: '判断：它不是数字 Token',
      desc: digitDesc(tk)
    });

    const num1 = stack.pop();
    snap({
      line: 10, phase: 'pop1', idx: i, token: tk, num1: num1, popped: [num1],
      title: `num1 = stack.pop() → ${num1}`,
      desc: `第一次弹出得到 num1 = ${num1}。它是最靠近运算符的那个值，也就是运算式里的右操作数；画面中的栈已经少掉一个元素。`
    });

    const num2 = stack.pop();
    snap({
      line: 11, phase: 'pop2', idx: i, token: tk, num1: num1, num2: num2, popped: [num1, num2],
      title: `num2 = stack.pop() → ${num2}`,
      desc: `第二次弹出得到 num2 = ${num2}，它是左操作数。顺序很重要：先弹出的是右操作数，后弹出的才是左操作数 —— 减法和除法都依赖这个顺序。`
    });

    const branchLine = tk === '+' ? 13 : tk === '-' ? 16 : tk === '*' ? 19 : 22;
    snap({
      line: branchLine, phase: 'branch', idx: i, token: tk, num1: num1, num2: num2, popped: [num1, num2],
      title: `运算符是「${tk}」`,
      desc: tk === '/'
        ? '前面的 char == "+"、char == "-"、char == "*" 都不成立，所以走最后的 else 分支，执行 Python 的 num = int(num2 / num1)。'
        : `命中 char == "${tk}" 分支，执行 num = ${tk === '+' ? 'num1 + num2' : tk === '-' ? 'num2 - num1' : 'num1 * num2'}。`
    });

    const num = compute(tk, num1, num2);
    const calcLine = tk === '+' ? 14 : tk === '-' ? 17 : tk === '*' ? 20 : 23;
    snap({
      line: calcLine, phase: 'calc', idx: i, token: tk, num1: num1, num2: num2, num: num,
      popped: [num1, num2],
      title: `计算得到 ${num}`,
      desc: calcDesc(tk, num1, num2, num)
    });

    stack.push(num);
    snap({
      line: 25, phase: 'push-result', idx: i, token: tk, num1: num1, num2: num2, num: num,
      justPushed: true, popped: [num1, num2],
      title: `结果 ${num} 重新入栈`,
      desc: `执行 stack.append(num)。刚算出的 ${num} 成为新的栈顶，接下来会像普通数字一样参与后面的运算。`
    });
  });

  snap({
    line: 27, phase: 'return', result: stack[0],
    title: `return stack[0] → ${stack[0]}`,
    desc: `所有 Token 处理完毕，栈里恰好剩下一个值 ${stack[0]}，它就是整个表达式的最终结果。中途的计算结果都只是中间值，到这里才成为答案。`
  });

  return out;
}

function digitDesc(tk) {
  const rest = lstripMinus(tk);
  /* 数字 Token：用当前 Token 动态生成解释，不写死某个示例数字 */
  if (OPERATORS.indexOf(tk) < 0) {
    const signed = tk.charAt(0) === '-';
    const isZero = Number(tk) === 0;
    if (!signed) {
      return `char.lstrip("-") 不会改变 "${tk}"，它是纯数字串，所以 isdigit() 为 True，进入 stack.append(int(char)) 分支。`;
    }
    const head = `char.lstrip("-") 把开头的负号去掉，得到 "${rest}"，这是纯数字串，所以 isdigit() 为 True。`;
    return head + (isZero
      ? `"${tk}" 是一个带负号的数字 Token：负号不会让它的值小于 0，转换成整数后就是 0。`
      : `"${tk}" 是「一个负数 Token」，而不是运算符 "-" 再加上数字 ${rest}。`);
  }
  /* 运算符 */
  if (tk === '-') {
    return 'char.lstrip("-") 会去掉开头的 "-"，只剩下空字符串 ""；空字符串的 isdigit() 为 False，所以 "-" 不会被当成数字。'
      + '这正是「负整数 Token」与「减号运算符」的区别：两者都以 "-" 开头，但去掉负号后一个是数字串、一个是空串。';
  }
  return `char.lstrip("-") 得到 "${rest}"，它不是纯数字串，因此 isdigit() 为 False，进入 else 分支按运算符处理。`;
}

function calcDesc(tk, num1, num2, num) {
  if (tk === '+') return `执行 num = num1 + num2 = ${num1} + ${num2} = ${num}。加法交换两个操作数不影响结果。`;
  if (tk === '*') return `执行 num = num1 * num2 = ${num1} * ${num2} = ${num}。乘法交换两个操作数也不影响结果。`;
  if (tk === '-') return `执行 num = num2 - num1 = ${num2} - ${num1} = ${num}。减法不能颠倒顺序：写成 num1 - num2 会得到 ${norm(num1 - num2)}。`;
  const exact = num2 / num1;
  if (Number.isInteger(exact)) {
    return `执行 num = int(num2 / num1) = int(${num2} / ${num1}) = ${num}。这次除法正好整除，取整没有改变数值。`;
  }
  const floor = Math.floor(exact);
  const note = (exact < 0 && floor !== num)
    ? `注意这不是向下取整：Python 的 ${num2} // ${num1} 会得到 ${floor}，而题目要求的是向零截断，所以结果是 ${num}。`
    : `向零截断后得到 ${num}。`;
  return `执行 num = int(num2 / num1) = int(${num2} / ${num1}) = int(${exact}) = ${num}。${note}`;
}

/* ---------- 运行时状态 ---------- */
let tokens = [];
let steps = [];
let at = 0;
let timer = null;

function stop() {
  if (timer) { clearInterval(timer); timer = null; }
  $('play').textContent = '▶ 自动播放';
}
function setError(msg) { $('error').textContent = msg || ''; }

/* ---------- 输入变更：停播放 → 校验 → 重新生成步骤 → 回到初始位置 ---------- */
function refresh() {
  stop();
  const parsed = parseInput($('source').value);
  tokens = parsed.tokens || [];
  let err = parsed.error || null;
  if (!err && tokens.length) err = validateRun(tokens).error || null;

  if (err) {
    setError(err);
    steps = []; at = 0;
    $('progress').textContent = '0 / 0';
    measureHeights(); applyStackHeight(); render();
    return;
  }
  setError('');
  steps = solve150(tokens);
  at = 0;
  measureHeights();
  applyStackHeight();
  render();
}

/* ---------- 渲染 ---------- */
function keepTopVisible(el) {
  const top = el.querySelector('.rpn-cell.top');
  if (!top) return;
  const b = el.getBoundingClientRect(), t = top.getBoundingClientRect();
  const pad = 2;
  if (t.top < b.top + pad) el.scrollTop -= (b.top - t.top) + pad;
  else if (t.bottom > b.bottom - pad) el.scrollTop += (t.bottom - b.bottom) + pad;
}

/* 让当前 Token 尽量留在可见区：只调整容器自身的 scrollLeft，不用 scrollIntoView */
function keepTokenVisible(box) {
  const cur = box.querySelector('.rpn-tok.current');
  if (!cur) return;
  const b = box.getBoundingClientRect(), c = cur.getBoundingClientRect();
  const pad = 8;
  if (c.left < b.left + pad) box.scrollLeft -= (b.left - c.left) + pad;
  else if (c.right > b.right - pad) box.scrollLeft += (c.right - b.right) + pad;
}

function renderTokens(st) {
  const box = $('tokens');
  box.replaceChildren();
  if (!tokens.length) {
    const e = document.createElement('span');
    e.className = 'rpn-empty-cell';
    e.textContent = '请输入 Token';
    box.append(e);
    return;
  }
  tokens.forEach((t, i) => {
    const el = document.createElement('span');
    el.className = 'rpn-tok'
      + (st && i === st.idx ? ' current' : '')
      + (st && st.idx >= 0 && i < st.idx ? ' done' : '');
    el.textContent = t;
    el.dataset.index = String(i);
    box.append(el);
  });
  keepTokenVisible(box);
}

function renderStack(st) {
  const box = $('v-stack');
  box.replaceChildren();
  const arr = st ? st.stack : [];
  if (!arr.length) {
    const e = document.createElement('span');
    e.className = 'rpn-empty-cell';
    e.textContent = '空栈';
    box.append(e);
    return;
  }
  /* 栈顶在上：倒序渲染，滚动条默认位置就能看到栈顶 */
  for (let i = arr.length - 1; i >= 0; i--) {
    const cell = document.createElement('div');
    const isTop = i === arr.length - 1;
    const isNew = isTop && st && st.justPushed;
    cell.className = 'rpn-cell' + (isTop ? ' top' : '') + (isNew ? ' just' : '');

    const val = document.createElement('span');
    val.className = 'rpn-val';
    val.textContent = String(arr[i]);

    const tags = document.createElement('span');
    tags.className = 'rpn-tags';
    if (isTop) {
      const t = document.createElement('span');
      t.className = 'rpn-tag';
      t.textContent = '栈顶';
      tags.append(t);
    }
    if (isNew) {
      const t = document.createElement('span');
      t.className = 'rpn-tag new';
      t.textContent = '新';
      tags.append(t);
    }
    cell.append(val, tags);
    box.append(cell);
  }
  keepTopVisible(box);
}

function renderPopped(st) {
  const box = $('popped');
  box.replaceChildren();
  const list = st ? st.popped : [];
  if (!list.length) {
    const e = document.createElement('span');
    e.className = 'rpn-pempty';
    e.textContent = '还没有弹出操作数';
    box.append(e);
    return;
  }
  const labels = ['num1（右操作数）', 'num2（左操作数）'];
  list.forEach((v, i) => {
    const c = document.createElement('span');
    c.className = 'rpn-pchip';
    c.textContent = `${labels[i] || '操作数'} = ${v}`;
    box.append(c);
  });
}

function exprLine(st) {
  const t = st.token, a = st.num1, b = st.num2;
  if (t === '+') return `num1 + num2 = ${a} + ${b} = ${st.num}`;
  if (t === '-') return `num2 - num1 = ${b} - ${a} = ${st.num}`;
  if (t === '*') return `num1 * num2 = ${a} * ${b} = ${st.num}`;
  return `int(num2 / num1) = int(${b} / ${a}) = ${st.num}`;
}

const NUM = v => (v === null || v === undefined) ? '—' : String(v);

function renderCalc(st) {
  const box = $('calc');
  box.replaceChildren();
  const row = (k, v, cls) => {
    const d = document.createElement('div');
    d.className = 'rpn-kv' + (cls ? ' ' + cls : '');
    const kk = document.createElement('span'); kk.className = 'rpn-k'; kk.textContent = k;
    const vv = document.createElement('span'); vv.className = 'rpn-v'; vv.textContent = v;
    d.append(kk, vv);
    return d;
  };
  const note = (text, cls) => {
    const e = document.createElement('div');
    e.className = 'rpn-expr' + (cls ? ' ' + cls : '');
    e.textContent = text;
    return e;
  };

  if (!st) {
    box.append(row('当前 Token', '—'), row('num1（右操作数）', '—'), row('num2（左操作数）', '—'),
      note('开始输入后，这里显示当前 Token 与它的运算过程。', 'muted'));
    return;
  }
  box.append(
    row('当前 Token', NUM(st.token)),
    row('num1（右操作数）', st.num1 === null ? '—' : String(st.num1)),
    row('num2（左操作数）', st.num2 === null ? '—' : String(st.num2))
  );
  if (st.phase === 'return') box.append(note(`最终结果：${st.result}`, 'ok'));
  else if (st.phase === 'calc' || st.phase === 'push-result') box.append(note(exprLine(st), 'ok'));
  else if (st.phase === 'branch') box.append(note(`运算符「${st.token}」，下一步开始计算`));
  else if (st.phase === 'pop1') box.append(note(`num1 = stack.pop() → ${st.num1}`));
  else if (st.phase === 'pop2') box.append(note(`num2 = stack.pop() → ${st.num2}`));
  else if (st.phase === 'init') box.append(note('栈是空的，还没有任何操作数。', 'muted'));
  else if (st.phase === 'token') box.append(note(`即将判断「${st.token}」是不是数字 Token。`, 'muted'));
  else if (st.phase === 'digit-check') {
    /* digit-check 只表示「正在判断」，判断结果可能是 True 也可能是 False，
       这里必须按当前 Token 的实际类型给出结论，不能一律说成数字 Token。 */
    box.append(note(OPERATORS.indexOf(st.token) < 0
      ? '确认是数字 Token，下一步转换为整数并入栈。'
      : '确认不是数字 Token，接下来依次弹出两个操作数。', 'muted'));
  }
  else if (st.phase === 'push') box.append(note('数字已经入栈，本步不涉及运算。', 'muted'));
  else box.append(note('本步不涉及运算。', 'muted'));
}

/* 状态框与运算面板的高度都按「整条 Token 序列的全部步骤 + 初始态」预计算，
   与当前步骤无关，因此同一输入内高度恒定，不会推动下方的控制按钮。
   宽度变化会改变换行，所以 resize / load 时重新测量。 */
let statusPx = 0, calcPx = 0;

function measureHeights() {
  const sBox = $('status'), cBox = $('calc');
  const prevS = sBox.style.height, prevC = cBox.style.height;
  sBox.style.height = 'auto';
  cBox.style.height = 'auto';
  let sNeed = 0, cNeed = 0;
  [null].concat(steps).forEach(st => {
    renderStatus(st);
    const h1 = sBox.offsetHeight;
    if (h1 > sNeed) sNeed = h1;
    renderCalc(st);
    const h2 = cBox.offsetHeight;
    if (h2 > cNeed) cNeed = h2;
  });
  sBox.style.height = prevS;
  cBox.style.height = prevC;
  statusPx = sNeed;
  calcPx = cNeed;
}

function applyHeights() {
  $('status').style.height = statusPx > 0 ? statusPx + 'px' : '';
  $('calc').style.height = calcPx > 0 ? calcPx + 'px' : '';
}

function renderStatus(st) {
  const box = $('status');
  box.className = 'status' + (st && st.phase === 'return' ? ' ok' : '');
  $('status-title').textContent = st ? st.title : '等待输入';
  $('status-desc').textContent = st
    ? st.desc
    : '用空格分隔输入一组 Token，算法会按顺序处理它们。输入改变后立即重新生成步骤。';
}

function renderAnswer(st) {
  const done = !!st && st.phase === 'return';
  $('answer').textContent = done ? String(st.result) : '—';
  $('answer-note').textContent = done
    ? '所有 Token 已处理完，这是最终结果。'
    : (steps.length ? '还在计算中：只有走到最后一个步骤，这里才显示最终结果。' : '');
}

/* 栈容器高度按「整条序列的最大栈深」一次性设定，与当前步骤无关；
   超过 6 个元素时在容器内部纵向滚动。高度按元素实际的 padding / border / row-gap 计算。 */
function applyStackHeight() {
  let max = 0;
  steps.forEach(s => { if (s.stack.length > max) max = s.stack.length; });
  const n = Math.min(Math.max(max, 3), 6);
  const el = $('v-stack');
  const cs = getComputedStyle(el);
  const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  const bor = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
  const gap = parseFloat(cs.rowGap) || 6;
  el.style.height = Math.ceil(40 * n + gap * (n - 1) + pad + bor) + 'px';
}

function render() {
  const n = steps.length;
  const st = n ? steps[at] : null;

  applyStackHeight();

  $('prev').disabled = !n || at === 0;
  $('next').disabled = !n || at === n - 1;
  $('play').disabled = n < 2;
  $('range').max = Math.max(0, n - 1);
  $('range').value = at;
  const tokNow = st ? (st.idx >= 0 ? st.idx + 1 : (st.phase === 'return' ? tokens.length : 0)) : 0;
  $('progress').textContent = n
    ? `步骤 ${at} / ${n - 1} · Token ${tokNow} / ${tokens.length}`
    : '0 / 0';

  document.querySelectorAll('.code-line').forEach(el =>
    el.classList.toggle('active', !!st && Number(el.dataset.line) === st.line));

  renderTokens(st);
  renderStack(st);
  renderPopped(st);
  renderCalc(st);
  renderStatus(st);
  renderAnswer(st);
  applyHeights();
}

/* ---------- 输入与按钮 ---------- */
/* 在光标处插入运算符；若选中了文字则替换选区。前后按需补空格，保证 Token 之间以空白分隔。 */
function insertOperator(op) {
  const inp = $('source');
  const v = inp.value;
  const start = typeof inp.selectionStart === 'number' ? inp.selectionStart : v.length;
  const end = typeof inp.selectionEnd === 'number' ? inp.selectionEnd : v.length;
  const before = v.slice(0, start);
  const after = v.slice(end);
  let ins = op;
  if (before && !/\s$/.test(before)) ins = ' ' + ins;
  if (after && !/^\s/.test(after)) ins = ins + ' ';
  const next = before + ins + after;

  if (next.trim() && next.trim().split(/\s+/).length > MAX_TOKENS) {
    setError(`本演示最多 ${MAX_TOKENS} 个 Token，这次插入会让数量超限（已保留原有内容，未插入）。这是可视化限制，不是 LeetCode 原题限制。`);
    return;
  }

  inp.value = next;
  const caret = (before + ins).replace(/\s+$/, '').length;
  inp.focus();
  try { inp.setSelectionRange(caret, caret); } catch (e) { /* 某些环境不支持，忽略 */ }
  inp.dispatchEvent(new Event('input', { bubbles: true }));
}

document.querySelectorAll('#quick .rpn-op').forEach(btn => {
  /* 按下时阻止默认行为，避免按钮抢走输入框焦点与选区 */
  btn.addEventListener('mousedown', e => e.preventDefault());
  btn.addEventListener('click', () => insertOperator(btn.dataset.op));
});

$('source').addEventListener('input', refresh);
$('reset').addEventListener('click', () => {
  $('source').value = DEFAULT_INPUT;
  refresh();
});
$('prev').addEventListener('click', () => { stop(); at = Math.max(0, at - 1); render(); });
$('next').addEventListener('click', () => { stop(); at = Math.min(steps.length - 1, at + 1); render(); });
$('range').addEventListener('input', e => { stop(); at = Number(e.target.value); render(); });
$('play').addEventListener('click', () => {
  if (steps.length < 2) return;
  if (timer) { stop(); return; }
  if (at === steps.length - 1) at = 0;
  timer = setInterval(() => {
    if (at < steps.length - 1) { at++; render(); } else stop();
  }, 900);
  $('play').textContent = 'Ⅱ 暂停播放';
  render();
});
$('copy').addEventListener('click', () => {
  const st = steps.length ? steps[steps.length - 1] : null;
  const v = st ? String(st.result) : '—';
  const done = () => { $('copy').textContent = '已复制'; setTimeout(() => { $('copy').textContent = '复制结果'; }, 1100); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(v).then(done, () => { $('copy').textContent = '请手动复制'; setTimeout(() => { $('copy').textContent = '复制结果'; }, 1300); });
  } else {
    $('copy').textContent = '请手动复制';
    setTimeout(() => { $('copy').textContent = '复制结果'; }, 1300);
  }
});

/* 宽度变化会改变换行行数，必须重新测量面板高度 */
let rszTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(rszTimer);
  rszTimer = setTimeout(() => { measureHeights(); render(); }, 120);
});
/* 字体加载完成前量到的高度可能偏小，加载后再校正一次 */
window.addEventListener('load', () => { measureHeights(); render(); });

$('source').value = DEFAULT_INPUT;
refresh();
