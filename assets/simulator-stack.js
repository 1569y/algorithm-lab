/* Algorithm Lab · LC20 有效的括号 · v0.4.3
   步骤快照严格遵循页面上的 Python 代码执行顺序。
   约定：每个步骤代表“某一行执行完之后”的状态，代码高亮与画面状态始终同步。 */
const $=id=>document.getElementById(id);

/* 与页面展示的 Python 代码逐行一致（1-based 行号用于高亮） */
const CODE=[
'class Solution:',
'    def isValid(self, s: str) -> bool:',
'        stack = []',
'',
'        match = {',
'            ")": "(",',
'            "]": "[",',
'            "}": "{",',
'        }',
'',
'        for current in s:',
'',
'            # 左括号直接入栈',
'            if current in "([{":',
'                stack.append(current)',
'',
'            # 否则就是右括号',
'            else:',
'                # 没有左括号可以和它匹配',
'                if not stack:',
'                    return False',
'',
'                # 栈顶和当前右括号不对应',
'                if stack[-1] != match[current]:',
'                    return False',
'',
'                # 匹配成功，弹出栈顶',
'                stack.pop()',
'',
'        # 最后栈必须为空',
'        return not stack'
];

const LEFT='([{';
const MATCH={')':'(',']':'[','}':'{'};
const MAX_LEN=24;

function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('code').innerHTML=CODE.map((line,i)=>`<span class="code-line" data-line="${i+1}">${escapeHTML(line)||' '}</span>`).join('');

/* 生成完整状态快照；不改变算法本身，只把原有执行顺序显式化 */
function solve20(s){
  const out=[];
  const stack=[];
  /* 每次调用都捕获“此刻”的栈内容，保证画面反映该行执行后的真实状态 */
  const snap=(st)=>{out.push(Object.assign({stack:[...stack],idx:-1,match:null,result:null},st));};

  snap({kind:'init',line:3,title:'初始化：创建一个空栈',
    note:'算法还没有开始遍历字符，先建立空栈与映射表。',
    desc:'stack = [] 建立空列表。它保存“已经出现、但还没有被匹配掉”的左括号，是本题唯一的辅助空间。'});

  snap({kind:'dict',line:5,title:'建立括号映射字典 match',
    note:'算法还没有开始遍历字符，先建立空栈与映射表。',
    desc:'match 把每个右括号映射到它允许匹配的左括号：")"→"("、"]"→"["、"}"→"{"，于是判断不需要写一长串条件。'});

  for(let idx=0;idx<s.length;idx++){
    const current=s[idx];
    const isLeft=LEFT.includes(current);

    snap({kind:'for',line:11,idx,title:`遍历到第 ${idx+1} 个字符“${current}”`,
      note:isLeft
        ?`这一步只是取出字符。“${current}”是左括号，下一步会直接入栈；入栈阶段不产生匹配结果。`
        :`这一步只是取出字符。“${current}”是右括号，下一步要先检查栈是否为空，再和栈顶比较。`,
      desc:isLeft
        ?`for current in s 取出第 ${idx+1} 个字符“${current}”。它是左括号，自己没有闭合对象，下一步会先存入栈中等待匹配。`
        :`for current in s 取出第 ${idx+1} 个字符“${current}”。它是右括号，接下来要先检查栈是否为空，再和栈顶比较，找出能与它配对的左括号。`});

    if(isLeft){
      stack.push(current);
      snap({kind:'push',line:15,idx,title:`左括号“${current}”直接入栈`,
        note:`“${current}”已入栈等待匹配。此步是入栈操作，不涉及匹配判断。`,
        desc:`current 属于 "([{"，执行 stack.append(current)。左括号没有闭合对象，先存着等右括号来找它。`});
      continue;
    }

    const expect=MATCH[current];

    snap({kind:'check-empty',line:20,idx,title:'先检查栈是否为空',
      match:{close:current,expect,top:stack.length?stack[stack.length-1]:null,ok:null},
      verdict:stack.length
        ?{text:'栈非空，继续比较栈顶',state:'pass'}
        :{text:'栈为空 → 下一步 return False',state:'bad'},
      desc:stack.length
        ?`if not stack：栈里还有未匹配的左括号，条件不成立，继续往下比较栈顶。这一步必须先做，否则空栈时读取 stack[-1] 会出错。`
        :`if not stack：栈是空的，说明这个右括号前面没有任何左括号可以和它匹配，下一步会直接返回 False，不需要再读取栈顶。`});

    if(!stack.length){
      snap({kind:'fail-empty',line:21,idx,result:false,
        match:{close:current,expect,top:null,ok:false},
        verdict:{text:'已执行 return False：空栈遇右括号',state:'fail'},
        title:'空栈遇到右括号，返回 False',
        desc:'return False：没有可匹配的左括号，字符串无效。算法立即结束，不再检查后面的字符。'});
      return out;
    }

    snap({kind:'match-check',line:24,idx,title:'比较栈顶与期望的左括号',
      match:{close:current,expect,top:stack[stack.length-1],ok:stack[stack.length-1]===expect},
      verdict:stack[stack.length-1]===expect
        ?{text:'栈顶一致，匹配成功',state:'ok'}
        :{text:'栈顶不一致 → 下一步 return False',state:'bad'},
      desc:`if stack[-1] != match[current]：右括号必须和“最近尚未处理的左括号”配对，也就是栈顶；具体比较结果见下方三张卡片。`});

    if(stack[stack.length-1]!==expect){
      snap({kind:'fail-type',line:25,idx,result:false,
        match:{close:current,expect,top:stack[stack.length-1],ok:false},
        verdict:{text:'已执行 return False：类型不匹配',state:'fail'},
        title:'类型不匹配，返回 False',
        desc:'return False：栈顶左括号和当前右括号不是一对，嵌套顺序错误，字符串无效。'});
      return out;
    }

    const popped=stack.pop();
    snap({kind:'pop',line:28,idx,title:`匹配成功，弹出栈顶 ${expect}`,
      match:{close:current,expect,top:popped,popped:true,ok:true},
      verdict:{text:`已执行 stack.pop()，“${popped}”已出栈`,state:'ok'},
      desc:`stack[-1] 与 match[current] 相等，执行 stack.pop()。确认匹配后才允许出栈，否则会丢掉错误的左括号。`});
  }

  snap({kind:'finish',line:31,title:stack.length?'遍历结束，栈不为空':'遍历结束，栈为空',
    note:'for 循环已经结束，不再有字符需要匹配。',
    desc:stack.length
      ?`return not stack：栈里还剩 ${stack.length} 个左括号没有等到右括号，字符串无效。`
      :'return not stack：栈已经空了，说明每个左括号都找到了对应的右括号，字符串有效。',
    result:!stack.length});

  return out;
}

let steps=[],at=0,timer=null,valid=false;

function stop(){if(timer){clearInterval(timer);timer=null}$('play').textContent='▶ 自动播放'}

const tooLongMsg=n=>`本演示最多 ${MAX_LEN} 个字符（当前 ${n} 个）。LeetCode 原题的上限是 1 ≤ s.length ≤ 10^4，这里的 ${MAX_LEN} 是可视化长度限制，请缩短输入。`;

function parse(){
  stop();
  const raw=$('source').value;
  const err=$('error');
  err.textContent='';
  const s=raw.trim();

  if(!s){
    err.textContent='请输入至少一个字符，例如 ([]{})、([{}]) 或 (]。';
    valid=false;steps=[];at=0;render();return;
  }
  const bad=[...new Set([...s].filter(c=>!LEFT.includes(c)&&!(c in MATCH)))];
  if(bad.length){
    err.textContent=`只支持 ( ) [ ] { } 六种括号，请检查这些字符：${bad.join(' ')}`;
    valid=false;steps=[];at=0;render();return;
  }
  if(s.length>MAX_LEN){
    err.textContent=tooLongMsg(s.length);
    valid=false;steps=[];at=0;render();return;
  }

  steps=solve20(s);
  at=0;valid=true;render();
}

/* 让当前栈顶保持在 #stack 的可见区域内。
   只用容器自身的 scrollLeft 做最小幅度调整，不调用 scrollIntoView，
   因此绝不会滚动页面或其祖先容器。仅当栈顶不在可见范围内时才移动，
   栈短时不产生任何滚动，用户手动横向查看历史元素也不受影响。 */
function keepStackTopVisible(){
  const box=$('stack');
  const top=box.querySelector('.scell.top');
  if(!top)return;
  const b=box.getBoundingClientRect();
  const t=top.getBoundingClientRect();
  const pad=2;                        /* 容差，避免栈顶紧贴边框被遮住 */
  if(t.right>b.right-pad)box.scrollLeft+=(t.right-b.right)+pad;
  else if(t.left<b.left+pad)box.scrollLeft-=(b.left-t.left)+pad;
}

function render(){
  const st=steps[at];
  const ready=valid&&!!st;

  $('prev').disabled=!ready||at===0;
  $('next').disabled=!ready||at===steps.length-1;
  $('play').disabled=!ready||steps.length<2;
  $('range').max=Math.max(0,steps.length-1);
  $('range').value=at;
  $('progress').textContent=ready?`${at} / ${steps.length-1}`:'0 / 0';

  document.querySelectorAll('.code-line').forEach(el=>el.classList.toggle('active',!!st&&Number(el.dataset.line)===st.line));

  /* 当前字符串 */
  const tokens=$('tokens');
  tokens.replaceChildren();
  const s=$('source').value.trim();
  if(!s){
    const e=document.createElement('span');
    e.className='stack-empty';e.textContent='等待输入';
    tokens.append(e);
  }else{
    [...s].forEach((c,i)=>{
      const el=document.createElement('span');
      el.className='tok'+(st&&st.idx===i?' current':st&&i<st.idx?' done':' pending');
      el.textContent=c;
      tokens.append(el);
    });
  }

  /* 栈：最右侧为栈顶 */
  const box=$('stack');
  box.replaceChildren();
  if(!st||!st.stack.length){
    const e=document.createElement('span');
    e.className='stack-empty';e.textContent='空栈';
    box.append(e);
  }else{
    st.stack.forEach((c,i)=>{
      const isTop=i===st.stack.length-1;
      const el=document.createElement('span');
      el.className='scell'+(isTop?' top':'');
      const v=document.createElement('span');v.textContent=c;
      el.append(v);
      if(isTop){const t=document.createElement('span');t.className='tag';t.textContent='栈顶';el.append(t)}
      box.append(el);
    });
  }

  /* 匹配关系：只在右括号阶段给出有意义的比较 */
  const m=$('match');
  m.replaceChildren();
  if(st&&st.match){
    const info=st.match;
    const cells=info.popped
      ?[['当前右括号',info.close],['期望左括号',info.expect],['已弹出',info.top]]
      :[['当前右括号',info.close],['期望左括号',info.expect],['实际栈顶',info.top===null?'空':info.top]];
    cells.forEach(([k,v])=>{
      const cell=document.createElement('div');
      cell.className='match-cell';
      const kk=document.createElement('span');kk.className='k';kk.textContent=k;
      const vv=document.createElement('span');vv.className='v';vv.textContent=v;
      cell.append(kk,vv);
      m.append(cell);
    });
    /* 结论文字来自步骤快照，避免文字与代码行/画面状态不一致 */
    const verdict=document.createElement('div');
    const vd=st.verdict||{text:'',state:''};
    verdict.className='verdict'+(vd.state?' '+vd.state:'');
    verdict.textContent=vd.text;
    m.append(verdict);
  }else{
    const n=document.createElement('p');
    n.className='match-note';
    n.textContent=(st&&st.note)||'输入有效字符串后，这里显示右括号与栈顶的比较。';
    m.append(n);
  }

  /* 状态与结果 */
  const status=$('status');
  status.className='status'+(st&&st.result===false?' fail':'');
  $('status-title').textContent=st?st.title:'等待有效输入';
  $('status-desc').textContent=st?st.desc:'请检查上方输入。';

  const rb=$('result-box');
  rb.className='result'+(st&&st.result===true?' ok':st&&st.result===false?' bad':'');
  $('answer').textContent=st&&st.result!==null?String(st.result):(ready?'尚未得出结果':'—');

  /* 每次渲染后确保栈顶可见（上一步 / 下一步 / 自动播放 / 进度跳转共用此路径） */
  keepStackTopVisible();
}

$('prev').onclick=()=>{stop();at=Math.max(0,at-1);render()};
$('next').onclick=()=>{stop();at=Math.min(steps.length-1,at+1);render()};
$('range').oninput=e=>{stop();at=Number(e.target.value);render()};
$('reset').onclick=parse;
$('play').onclick=()=>{
  if(timer){stop();return}
  if(at===steps.length-1)at=0;
  timer=setInterval(()=>{if(at<steps.length-1){at++;render()}else stop()},950);
  $('play').textContent='Ⅱ 暂停播放';
  render();
};
$('copy').onclick=async()=>{
  const v=$('answer').textContent;
  try{await navigator.clipboard.writeText(v);$('copy').textContent='已复制';setTimeout(()=>$('copy').textContent='复制',1100)}
  catch(e){$('copy').textContent='请手动复制';setTimeout(()=>$('copy').textContent='复制',1300)}
};

/* ---------- 快捷括号输入 ----------
   使用原生 selectionStart / selectionEnd 在光标处插入，选中文字时替换选区。
   按钮按下时阻止默认行为，输入框不会失焦，因此选区始终有效；
   同时记录最近一次选区，作为输入框未聚焦时的兜底。
   插入后派发 input 事件，复用现有逻辑（停止自动播放 → 重新校验 → 重新生成步骤）。 */
(function(){
  const row=$('quick');
  if(!row)return;
  const src=$('source');
  let last={start:src.value.length,end:src.value.length};
  const remember=()=>{last={start:src.selectionStart,end:src.selectionEnd}};
  ['input','keyup','mouseup','select','blur','focus'].forEach(ev=>src.addEventListener(ev,remember));
  row.addEventListener('mousedown',e=>{if(e.target.closest('.quick-btn'))e.preventDefault()});
  row.addEventListener('touchstart',remember,{passive:true});

  row.querySelectorAll('.quick-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const ch=btn.dataset.ch;
      const focused=document.activeElement===src;
      const start=focused?src.selectionStart:last.start;
      const end=focused?src.selectionEnd:last.end;
      const v=src.value;
      const next=v.slice(0,start)+ch+v.slice(end);
      if(next.trim().length>MAX_LEN){
        $('error').textContent=tooLongMsg(v.trim().length)+'（已保留原有内容，未插入）';
        return;
      }
      src.value=next;
      const pos=Math.min(start+1,next.length);
      src.focus();
      src.setSelectionRange(pos,pos);
      last={start:pos,end:pos};
      src.dispatchEvent(new Event('input'));
      src.setSelectionRange(pos,pos);
    });
  });
})();

$('source').addEventListener('input',parse);
/* 字体加载完成后宽度可能变化，再校正一次栈的横向滚动位置 */
window.addEventListener('load',keepStackTopVisible);
parse();
