/* Algorithm Lab · LC155 最小栈 · v0.4.4
   严格使用作者题解中的最终 Python 实现，不更换算法、不把 <= 改成 <、
   不增加原代码没有的保护分支（输入合法性检查只发生在模拟器层）。

   步骤快照约定（DESIGN.md §6）：每个步骤代表「该行执行完之后」的状态，
   代码高亮、双栈画面与教学解释在时间顺序上保持一致。
   历史快照对两个栈都做深拷贝，绝不共享可变数组引用。 */
const $ = id => document.getElementById(id);

/* 与页面展示的 Python 代码逐行一致（1-based 行号用于高亮） */
const CODE = [
  'class MinStack:',
  '',
  '    def __init__(self):',
  '        self.stack = []',
  '        self.min_stack = []',
  '',
  '    def push(self, value: int) -> None:',
  '        self.stack.append(value)',
  '',
  '        if not self.min_stack or value <= self.min_stack[-1]:',
  '            self.min_stack.append(value)',
  '',
  '    def pop(self) -> None:',
  '        value = self.stack.pop()',
  '',
  '        if value == self.min_stack[-1]:',
  '            self.min_stack.pop()',
  '',
  '    def top(self) -> int:',
  '        return self.stack[-1]',
  '',
  '    def getMin(self) -> int:',
  '        return self.min_stack[-1]'
];

const MAX_OPS = 30;                       /* 模拟器限制，题目本身没有此限制 */
const INT_MIN = -2147483648, INT_MAX = 2147483647;   /* LeetCode 155 的 val 范围 */

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
$('code').innerHTML = CODE.map((line, i) =>
  `<span class="code-line" data-line="${i + 1}">${escapeHTML(line) || ' '}</span>`).join('');

const OP_LABEL = op => op.type === 'push' ? `push(${op.value})` : `${op.type}()`;

/* ---------- 操作序列合法性（只在模拟器层检查，不改动算法） ---------- */
function validateOps(ops) {
  let depth = 0;
  const bad = [];
  ops.forEach((op, i) => {
    if (op.type === 'push') { depth++; return; }
    if (depth === 0) {
      bad.push({ index: i, label: OP_LABEL(op), reason: `执行到第 ${i + 1} 项 ${OP_LABEL(op)} 时栈是空的` });
      return;
    }
    if (op.type === 'pop') depth--;
  });
  return bad;
}

/* ---------- 生成完整状态快照 ---------- */
function solve155(ops) {
  const out = [];
  const stack = [];
  const minStack = [];
  const results = [];                 /* 查询结果记录 */
  const minOf = () => minStack.length ? minStack[minStack.length - 1] : null;

  const snap = st => out.push(Object.assign({
    opIndex: -1, opLabel: '', phase: 'init',
    stack: [...stack], minStack: [...minStack],   /* 深拷贝，避免共享引用 */
    line: 0, title: '', desc: '',
    inMethod: false, minPending: false,
    justStack: false, justMin: false,
    query: null, popped: null, result: null,
    results: results.map(r => ({ opIndex: r.opIndex, label: r.label, value: r.value }))
  }, st));

  snap({
    line: 5, phase: 'init',
    title: '初始化 MinStack 实例',
    desc: 'self.stack 与 self.min_stack 同属这个对象，四个方法通过 self 共享数据。此刻两个栈都为空。'
  });

  ops.forEach((op, i) => {
    const label = OP_LABEL(op);

    if (op.type === 'push') {
      const v = op.value;
      snap({
        opIndex: i, opLabel: label, line: 7, phase: 'enter', inMethod: true,
        title: `开始执行 ${label}`,
        desc: `进入 push 方法。这是该操作执行前的状态，两个栈都还没有变化。`
      });

      stack.push(v);
      snap({
        opIndex: i, opLabel: label, line: 8, phase: 'append-stack', inMethod: true, justStack: true, minPending: true,
        title: `把 ${v} 压入普通栈`,
        desc: `执行 self.stack.append(value)，${v} 进入普通栈。min_stack 尚未处理它，最小值仍在更新中。`
      });

      const willAppend = minStack.length === 0 || v <= minOf();
      snap({
        opIndex: i, opLabel: label, line: 10, phase: 'push-cond',
        inMethod: willAppend, minPending: willAppend,
        title: willAppend ? '判断：需要更新 min_stack' : '判断：不需要更新 min_stack',
        desc: minStack.length === 0
          ? 'if 条件先看 not self.min_stack：min_stack 还是空的，没有历史最小值可比较，条件成立。'
          : (willAppend
            ? `最小值是 ${minOf()}，${v} ≤ ${minOf()}，条件成立。`
            : `最小值是 ${minOf()}，${v} > ${minOf()}，条件不成立：${v} 不会成为新的最小值，min_stack 不变。`)
      });

      if (willAppend) {
        minStack.push(v);
        snap({
          opIndex: i, opLabel: label, line: 11, phase: 'append-min', justMin: true,
          title: `最小值栈同步压入 ${v}`,
          desc: `执行 self.min_stack.append(value)。栈顶就是${v === minOf() && minStack.length > 1 ? '同样大小的最小值' : '当前最小值'}。`
        });
      }
      return;
    }

    if (op.type === 'pop') {
      snap({
        opIndex: i, opLabel: label, line: 13, phase: 'enter', inMethod: true,
        title: `开始执行 ${label}`,
        desc: '进入 pop 方法。这是该操作执行前的状态，两个栈都还没有变化。'
      });

      const opened = stack.pop();
      snap({
        opIndex: i, opLabel: label, line: 14, phase: 'pop-stack', inMethod: true, minPending: true,
        popped: opened,
        title: `普通栈弹出 ${opened}`,
        desc: `执行 self.stack.pop()，用 value 接收。pop() 返回 None，${opened} 是被弹出的元素。`
      });

      const sameAsMin = opened === minOf();
      snap({
        opIndex: i, opLabel: label, line: 16, phase: 'pop-cond',
        inMethod: sameAsMin, minPending: sameAsMin,
        title: '判断：弹出的元素是否就是当前最小值',
        desc: sameAsMin
          ? `栈顶 ${minOf()} 正好等于弹出的 ${opened}，说明被弹出的就是当前最小值，min_stack 也必须弹出。`
          : `栈顶 ${minOf()} 与弹出的 ${opened} 不相等，说明还有更小的元素留在普通栈里，min_stack 不需要变化。`
      });

      if (sameAsMin) {
        minStack.pop();
        snap({
          opIndex: i, opLabel: label, line: 17, phase: 'pop-min',
          title: '最小值栈同步弹出',
          desc: minStack.length
            ? `执行 self.min_stack.pop()。当前最小值恢复为它下面的历史最小值 ${minOf()}。`
            : '执行 self.min_stack.pop()。min_stack 已经空了，说明普通栈也空了。'
        });
      }
      return;
    }

    if (op.type === 'top') {
      snap({
        opIndex: i, opLabel: label, line: 19, phase: 'enter', inMethod: true,
        title: `开始执行 ${label}`,
        desc: '进入 top 方法。这是该操作执行前的状态，两个栈都还没有变化。'
      });
      const v = stack[stack.length - 1];
      results.push({ opIndex: i, label, value: v });
      snap({
        opIndex: i, opLabel: label, line: 20, phase: 'query',
        query: { kind: 'top', value: v }, result: v,
        title: `top() 返回 ${v}`,
        desc: `执行 return self.stack[-1]，读取普通栈栈顶 ${v}。top() 只读不改，两个栈保持原样。`
      });
      return;
    }

    /* getMin */
    snap({
      opIndex: i, opLabel: label, line: 22, phase: 'enter', inMethod: true,
      title: `开始执行 ${label}`,
      desc: '进入 getMin 方法。这是该操作执行前的状态，两个栈都还没有变化。'
    });
    const v = minOf();
    results.push({ opIndex: i, label, value: v });
    snap({
      opIndex: i, opLabel: label, line: 23, phase: 'query',
      query: { kind: 'getMin', value: v }, result: v,
      title: `getMin() 返回 ${v}`,
      desc: `执行 return self.min_stack[-1]。push/pop 一直在维护它，getMin 不必遍历普通栈，用时 O(1)。`
    });
  });

  return out;
}

/* ---------- 运行时状态 ---------- */
let ops = [];            /* 用户构造的操作序列 */
let steps = [];          /* 当前模拟的步骤快照 */
let at = 0;
let timer = null;
let running = false;     /* 是否已「开始模拟」 */
let editing = -1;        /* 正在编辑参数的操作下标 */

function stop() { if (timer) { clearInterval(timer); timer = null; } $('play').textContent = '▶ 自动播放'; }

/* ---------- 操作序列编辑 ---------- */
function opError() {
  const bad = validateOps(ops);
  return bad.length ? bad : null;
}

function renderOps() {
  const list = $('ops');
  list.replaceChildren();

  if (!ops.length) {
    const e = document.createElement('p');
    e.className = 'mstk-empty';
    e.textContent = '还没有操作。在左侧输入数值后点击 push，或直接点击 pop / top / getMin 添加操作。';
    list.append(e);
  } else {
    const cur = running && steps[at] ? steps[at].opIndex : -1;
    const bad = opError();
    const badSet = new Set((bad || []).map(b => b.index));
    ops.forEach((op, i) => {
      const row = document.createElement('div');
      row.className = 'mstk-op'
        + (i === cur ? ' current' : (cur >= 0 && i < cur ? ' done' : ''))
        + (badSet.has(i) ? ' bad' : '');
      row.dataset.index = String(i);

      const idx = document.createElement('span');
      idx.className = 'mstk-opidx';
      idx.textContent = String(i + 1) + '.';

      const label = document.createElement('span');
      label.className = 'mstk-oplabel';
      label.textContent = OP_LABEL(op);

      row.append(idx, label);

      if (badSet.has(i)) {
        const t = document.createElement('span');
        t.className = 'mstk-opbad';
        t.textContent = '栈空时不可调用';
        row.append(t);
      }

      if (op.type === 'push') {
        if (editing === i) {
          const inp = document.createElement('input');
          inp.type = 'number';
          inp.className = 'mstk-opinput';
          inp.value = String(op.value);
          inp.setAttribute('aria-label', `修改第 ${i + 1} 项 push 的数值`);
          const commit = () => {
            const n = Number(inp.value.trim());
            if (inp.value.trim() === '' || !Number.isSafeInteger(n) || n < INT_MIN || n > INT_MAX) {
              setError(`push 的数值必须是 ${INT_MIN} ~ ${INT_MAX} 之间的整数。`);
              inp.focus();
              return;
            }
            op.value = n;
            editing = -1;
            afterOpsChange();
          };
          inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { editing = -1; renderOps(); }
          });
          inp.addEventListener('blur', commit);
          row.append(inp);
          setTimeout(() => { inp.focus(); inp.select(); }, 0);
        } else {
          const edit = document.createElement('button');
          edit.type = 'button';
          edit.className = 'mstk-opbtn';
          edit.textContent = '编辑';
          edit.addEventListener('click', e => {
            e.stopPropagation();
            stop();
            editing = i;
            renderOps();
          });
          row.append(edit);
        }
      }

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'mstk-opbtn mstk-del';
      del.textContent = '×';
      del.setAttribute('aria-label', `删除第 ${i + 1} 项`);
      del.addEventListener('click', e => {
        e.stopPropagation();
        stop();
        ops.splice(i, 1);
        editing = -1;
        afterOpsChange();
      });
      row.append(del);

      /* 点击整行：跳转到该操作执行前的状态 */
      row.addEventListener('click', () => {
        if (!running) return;
        const t = steps.findIndex(s => s.opIndex === i && s.phase === 'enter');
        if (t < 0) return;
        stop();
        at = t;
        render();
      });

      list.append(row);
    });
  }

  const bad = opError();
  $('ops-count').textContent = ops.length
    ? `${ops.length} 项操作 · 上限 ${MAX_OPS}（模拟器限制，题目本身没有这个限制）`
    : `0 项操作 · 上限 ${MAX_OPS}（模拟器限制，题目本身没有这个限制）`;
  $('start').disabled = !ops.length || !!bad;
}

function setError(msg) { $('error').textContent = msg || ''; }

function afterOpsChange() {
  /* 序列变化后重新校验；不删除用户添加的操作，只提示 */
  const bad = opError();
  if (bad) {
    setError(`操作序列不合法：${bad.map(b => b.reason).join('；')}。LeetCode 155 保证 pop / top / getMin 只在非空栈上调用，请先补充 push 或删除这些操作。`);
    running = false; steps = []; at = 0; $('range').max = 0; $('range').value = 0;
    $('progress').textContent = '0 / 0';
    measureStatusHeight();
    renderStacks(null); renderStatus(null); renderResults(null); renderRunning(null);
    renderOps();
    $('prev').disabled = $('next').disabled = $('play').disabled = true;
    return;
  }
  setError('');
  if (running) { startSim(); } else { renderOps(); }
}

function addOp(op) {
  if (ops.length >= MAX_OPS) {
    setError(`本演示最多添加 ${MAX_OPS} 项操作。这是模拟器限制，LeetCode 原题没有这个限制。`);
    return;
  }
  stop();
  editing = -1;
  ops.push(op);
  afterOpsChange();
}

/* ---------- 开始模拟 ---------- */
function startSim() {
  stop();
  const bad = opError();
  if (bad) { afterOpsChange(); return; }
  if (!ops.length) { setError('请先添加至少一项操作。'); return; }
  setError('');
  steps = solve155(ops);
  at = 0;
  running = true;
  measureStatusHeight();   /* 先按整条序列定好高度，再首次渲染 */
  render();
}

/* ---------- 渲染 ---------- */
function keepTopVisible(el) {
  const top = el.querySelector('.mstk-cell.top');
  if (!top) return;
  const b = el.getBoundingClientRect(), t = top.getBoundingClientRect();
  const pad = 2;
  if (t.top < b.top + pad) el.scrollTop -= (b.top - t.top) + pad;
  else if (t.bottom > b.bottom - pad) el.scrollTop += (t.bottom - b.bottom) + pad;
}

function renderStack(el, arr, just) {
  el.replaceChildren();
  if (!arr || !arr.length) {
    const e = document.createElement('span');
    e.className = 'mstk-empty-cell';
    e.textContent = '空栈';
    el.append(e);
    return;
  }
  for (let i = arr.length - 1; i >= 0; i--) {           /* 栈顶在最上方 */
    const isTop = i === arr.length - 1;
    const cell = document.createElement('span');
    cell.className = 'mstk-cell' + (isTop ? ' top' : '') + (isTop && just ? ' just' : '');
    const v = document.createElement('span');
    v.className = 'mstk-val';
    v.textContent = String(arr[i]);
    cell.append(v);
    const tags = document.createElement('span');
    tags.className = 'mstk-tags';
    if (isTop) {
      const t1 = document.createElement('span');
      t1.className = 'mstk-tag';
      t1.textContent = '栈顶';
      tags.append(t1);
    }
    if (isTop && just) {
      const t2 = document.createElement('span');
      t2.className = 'mstk-tag new';
      t2.textContent = '变化';
      tags.append(t2);
    }
    cell.append(tags);
    el.append(cell);
  }
}

function renderStacks(st) {
  renderStack($('v-stack'), st ? st.stack : null, st ? st.justStack : false);
  renderStack($('v-min'), st ? st.minStack : null, st ? st.justMin : false);

  const mv = $('minv');
  if (!st) {
    mv.textContent = '—';
    mv.className = '';
    $('minhint').textContent = '';
    return;
  }
  if (st.minPending) {
    mv.textContent = '更新中…';
    mv.className = 'pending';
    $('minhint').textContent = '（min_stack 尚未更新）';
  } else {
    const v = st.minStack.length ? st.minStack[st.minStack.length - 1] : null;
    mv.textContent = v === null ? '（栈为空）' : String(v);
    mv.className = '';
    $('minhint').textContent = v === null ? '' : 'min_stack 栈顶';
  }
}

/* 状态框高度按「整条操作序列的全部步骤 + 初始态」中最高的一条解释一次性设定，
   与当前步骤无关，因此同一序列内高度恒定，不会推动下方的控制按钮。
   与 applyStackHeight 同一思路；区别是解释文字会随宽度换行，所以 width 变化时必须重算
   （见文件末尾的 resize / load 监听）。 */
let statusPx = 0;

function measureStatusHeight() {
  const box = $('status');
  const title = $('status-title');
  const desc = $('status-desc');
  const prevT = title.textContent, prevD = desc.textContent, prevH = box.style.height;

  const cands = [{ t: '等待操作序列', d: '在左侧构造你自己的操作序列，然后点击「开始模拟」。' }];
  steps.forEach(s => cands.push({ t: s.title, d: s.desc }));

  /* 先解除已有高度，再逐条量取内容自然高度；CSS 的 min-height 作为下限继续生效，
     因此短文案不会把状态框压到设计下限以下。 */
  box.style.height = 'auto';
  let need = 0;
  cands.forEach(c => {
    title.textContent = c.t;
    desc.textContent = c.d;
    const h = box.offsetHeight;               /* 含 padding / border / p 的上外边距 */
    if (h > need) need = h;
  });

  title.textContent = prevT;
  desc.textContent = prevD;
  box.style.height = prevH;
  statusPx = need;
}

function applyStatusHeight() {
  const box = $('status');
  box.style.height = statusPx > 0 ? statusPx + 'px' : '';
}

function renderStatus(st) {
  const box = $('status');
  box.className = 'status' + (st && st.minPending ? ' fail' : '');
  $('status-title').textContent = st ? st.title : '等待操作序列';
  $('status-desc').textContent = st
    ? st.desc
    : '在左侧构造你自己的操作序列，然后点击「开始模拟」。';
  applyStatusHeight();
}

function renderRunning(st) {
  const e = $('running');
  if (!st || st.opIndex < 0) {
    e.textContent = '';
    e.className = 'mstk-running';
    return;
  }
  e.className = 'mstk-running' + (st.inMethod ? ' on' : '');
  e.textContent = st.inMethod
    ? `正在执行 ${st.opLabel} · 第 ${st.opIndex + 1} 项`
    : `${st.opLabel} 已完成 · 第 ${st.opIndex + 1} 项`;
}

function renderResults(st) {
  const box = $('results');
  box.replaceChildren();
  const list = st ? st.results : [];
  if (!list.length) {
    const e = document.createElement('span');
    e.className = 'mstk-empty-cell';
    e.textContent = '还没有查询结果';
    box.append(e);
  } else {
    list.forEach(r => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.textContent = `${r.label} → ${r.value}`;
      box.append(c);
    });
  }

  const cur = st && st.query ? `${st.query.kind}() → ${st.query.value}` : null;
  $('answer').textContent = cur || '—';
  $('popped').textContent = st && st.popped !== null && st.popped !== undefined
    ? `本次弹出：${st.popped}` : '';
}

/* 双栈可视区高度按「整条序列的最大栈深」一次性设定，
   与当前步骤无关，因此高度恒定；超过 6 个元素时在容器内纵向滚动。
   高度按元素实际的 padding / border / row-gap 计算，避免盒模型差异造成 1-2px 裁切。 */
function applyStackHeight() {
  let d = 0, max = 0;
  ops.forEach(o => { if (o.type === 'push') { d++; if (d > max) max = d; } else if (o.type === 'pop') { d--; } });
  const n = Math.min(Math.max(max, 3), 6);
  const CELL = 40;                       /* .mstk-cell 的固定高度，与 CSS 一致 */
  ['v-stack', 'v-min'].forEach(id => {
    const el = $(id);
    const cs = getComputedStyle(el);
    const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const bor = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
    const gap = parseFloat(cs.rowGap) || 6;
    el.style.height = Math.ceil(CELL * n + gap * (n - 1) + pad + bor) + 'px';
  });
}

function render() {
  const st = running ? steps[at] : null;
  applyStackHeight();

  $('prev').disabled = !running || at === 0;
  $('next').disabled = !running || at === steps.length - 1;
  $('play').disabled = !running || steps.length < 2;
  $('range').max = Math.max(0, (steps.length || 1) - 1);
  $('range').value = at;
  const opTotal = ops.length;
  const opNow = st && st.opIndex >= 0 ? st.opIndex + 1 : 0;
  $('progress').textContent = running ? `步骤 ${at} / ${steps.length - 1} · 操作 ${opNow} / ${opTotal}` : '0 / 0';

  document.querySelectorAll('.code-line').forEach(el =>
    el.classList.toggle('active', !!st && Number(el.dataset.line) === st.line));

  renderStacks(st);
  renderRunning(st);
  renderStatus(st);
  renderResults(st);
  renderOps();

  keepTopVisible($('v-stack'));
  keepTopVisible($('v-min'));
}

/* ---------- 输入与按钮 ---------- */
function readValue() {
  const raw = $('value').value.trim();
  if (raw === '') { setError('请输入一个整数再进行 push。'); return null; }
  if (!/^[-+]?\d+$/.test(raw)) { setError('push 的数值必须是整数。'); return null; }
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < INT_MIN || n > INT_MAX) {
    setError(`push 的数值必须在 ${INT_MIN} ~ ${INT_MAX} 之间（LeetCode 155 的 val 范围）。`);
    return null;
  }
  return n;
}

$('add-push').addEventListener('click', () => {
  const v = readValue();
  if (v === null) return;
  setError('');
  addOp({ type: 'push', value: v });
});
['pop', 'top', 'getMin'].forEach(t => {
  $('add-' + t).addEventListener('click', () => { setError(''); addOp({ type: t }); });
});

$('clear').addEventListener('click', () => {
  stop();
  if (!ops.length) return;
  ops = [];
  editing = -1;
  running = false; steps = []; at = 0;
  setError('');
  $('range').max = 0; $('range').value = 0; $('progress').textContent = '0 / 0';
  $('prev').disabled = $('next').disabled = $('play').disabled = true;
  measureStatusHeight();
  renderOps(); renderStacks(null); renderRunning(null); renderStatus(null); renderResults(null);
});

$('start').addEventListener('click', startSim);

$('prev').onclick = () => { stop(); at = Math.max(0, at - 1); render(); };
$('next').onclick = () => { stop(); at = Math.min(steps.length - 1, at + 1); render(); };
$('range').oninput = e => { stop(); at = Number(e.target.value); render(); };
$('play').onclick = () => {
  if (!running) return;
  if (timer) { stop(); return; }
  if (at === steps.length - 1) at = 0;
  timer = setInterval(() => { if (at < steps.length - 1) { at++; render(); } else stop(); }, 950);
  $('play').textContent = 'Ⅱ 暂停播放';
  render();
};
$('copy').onclick = async () => {
  const v = [...$('results').querySelectorAll('.chip')].map(c => c.textContent).join('\n') || '—';
  try { await navigator.clipboard.writeText(v); $('copy').textContent = '已复制'; setTimeout(() => $('copy').textContent = '复制', 1100); }
  catch (e) { $('copy').textContent = '请手动复制'; setTimeout(() => $('copy').textContent = '复制', 1300); }
};

renderOps();
measureStatusHeight();
render();

/* 宽度变化会改变解释文字的换行行数，因此必须重新量取状态框高度。
   用 debounce 避免拖动窗口时反复测量。 */
let rszTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(rszTimer);
  rszTimer = setTimeout(() => { measureStatusHeight(); render(); }, 120);
});

/* 字体加载完成前量到的高度可能偏小（fallback 字体更窄），加载后再校正一次。 */
window.addEventListener('load', () => { measureStatusHeight(); render(); });
