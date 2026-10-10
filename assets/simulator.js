
const $=id=>document.getElementById(id);
const mode=document.body.dataset.mode;
const CODE=mode==='167' ? [
'class Solution:',
'    def twoSum(self, numbers: list[int], target: int) -> list[int]:',
'        i, j = 0, len(numbers) - 1',
'        while i < j:',
'            current = numbers[i] + numbers[j]',
'            if current < target:',
'                i += 1',
'            elif current > target:',
'                j -= 1',
'            else:',
'                return [i + 1, j + 1]'
]:[
'class Solution:',
'    def threeSum(self, nums: list[int]) -> list[list[int]]:',
'        nums.sort()',
'        result = []',
'        for i in range(len(nums) - 2):',
'            if i > 0 and nums[i] == nums[i - 1]:',
'                continue',
'            j, k = i + 1, len(nums) - 1',
'            while j < k:',
'                current = nums[i] + nums[j] + nums[k]',
'                if current < 0:',
'                    j += 1',
'                elif current > 0:',
'                    k -= 1',
'                else:',
'                    result.append([nums[i], nums[j], nums[k]])',
'                    j += 1; k -= 1',
'                    while j < k and nums[j] == nums[j - 1]:',
'                        j += 1',
'                    while j < k and nums[k] == nums[k + 1]:',
'                        k -= 1',
'        return result'
];
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('code').innerHTML=CODE.map((line,i)=>`<span class="code-line" data-line="${i+1}">${escapeHTML(line)||' '}</span>`).join('');
let steps=[],at=0,timer=null,valid=false;
function record(out,arr,st){out.push({arr:[...arr],i:null,j:null,k:null,found:[],line:0,kind:'init',...st,found:(st.found||[]).map(x=>[...x])})}
function solve167(arr,target){const out=[];let i=0,j=arr.length-1;record(out,arr,{i,j,line:3,title:'准备开始',desc:'数组已经有序。左指针从开头出发，右指针从末尾出发。'});
while(i<j){const sum=arr[i]+arr[j];if(sum===target){record(out,arr,{i,j,sum,line:11,kind:'match',title:`找到答案：${arr[i]} + ${arr[j]} = ${target}`,desc:`返回从 1 开始的下标 [${i+1}, ${j+1}]。`,found:[[i+1,j+1]]});return out}
if(sum<target){const left=arr[i];i++;record(out,arr,{i,j,sum,line:7,kind:'move',title:`${sum} < ${target}，左指针右移`,desc:`右端 ${arr[j]} 已是剩余范围最大值。${left} 与它相加仍太小，因此排除左端 ${left}；执行 i += 1 后，i 已移动到下标 ${i}。`})}
else{const right=arr[j];j--;record(out,arr,{i,j,sum,line:9,kind:'move',title:`${sum} > ${target}，右指针左移`,desc:`左端 ${arr[i]} 已是剩余范围最小值。与 ${right} 相加仍太大，因此排除右端 ${right}；执行 j -= 1 后，j 已移动到下标 ${j}。`})}}
record(out,arr,{i,j,line:4,kind:'end',title:'搜索结束：没有找到答案',desc:`两个指针已经交错（i = ${i}，j = ${j}），搜索区间为空。此演示允许输入不满足题目「存在唯一解」保证的数据，因此本次结果为无解。`});return out}
function solve15(source){const arr=[...source].sort((a,b)=>a-b),out=[],found=[];record(out,arr,{line:3,title:'先排序',desc:'三数之和先排序，使左右指针可以依据总和大小移动。'});
for(let i=0;i<arr.length-2;i++){
if(i>0&&arr[i]===arr[i-1]){record(out,arr,{i,line:7,found,kind:'skip',title:`跳过重复固定值 ${arr[i]}`,desc:'与上一次固定的数字相同，不再重复寻找同样的三元组。'});continue}
let j=i+1,k=arr.length-1;record(out,arr,{i,j,k,line:8,found,title:`固定 nums[${i}] = ${arr[i]}`,desc:`接下来在右侧寻找另外两个数，使它们的和等于 ${-arr[i]}。`});
while(j<k){const sum=arr[i]+arr[j]+arr[k];if(sum<0){const left=arr[j];j++;record(out,arr,{i,j,k,sum,found,line:12,kind:'move',title:`${arr[i]} + ${left} + ${arr[k]} = ${sum} < 0`,desc:`总和太小，当前左端 ${left} 不可能出现在答案里；执行 j += 1 后，j 已移动到下标 ${j}。`})}
else if(sum>0){const right=arr[k];k--;record(out,arr,{i,j,k,sum,found,line:14,kind:'move',title:`${arr[i]} + ${arr[j]} + ${right} = ${sum} > 0`,desc:`总和太大，当前右端 ${right} 不可能出现在答案里；执行 k -= 1 后，k 已移动到下标 ${k}。`})}
else{found.push([arr[i],arr[j],arr[k]]);record(out,arr,{i,j,k,sum,found,line:16,kind:'match',title:`找到三元组 [${arr[i]}, ${arr[j]}, ${arr[k]}]`,desc:'result.append 先记录这一组。此刻指针还停在原位，下一步才同时移动。'});j++;k--;
record(out,arr,{i,j,k,found,line:17,kind:'move',title:'左右指针同时向中间移动',desc:`执行 j += 1; k -= 1，j 变为 ${j}、k 变为 ${k}，跳过刚用过的一组，避免重复。`});
while(j<k&&arr[j]===arr[j-1]){const left=arr[j];j++;record(out,arr,{i,j,k,found,line:19,kind:'skip',title:`跳过重复左端 ${left}`,desc:`左端 ${left} 与刚经过的值相同，执行 j += 1 后 j 已移动到下标 ${j}，避免重复三元组。`})}
while(j<k&&arr[k]===arr[k+1]){const right=arr[k];k--;record(out,arr,{i,j,k,found,line:21,kind:'skip',title:`跳过重复右端 ${right}`,desc:`右端 ${right} 与刚经过的值相同，执行 k -= 1 后 k 已移动到下标 ${k}，避免重复三元组。`})}
}}}
record(out,arr,{line:22,found,kind:'end',title:'搜索完成',desc:`一共找到 ${found.length} 个不重复的三元组。`});return out}
function stop(){if(timer){clearInterval(timer);timer=null}$('play').textContent='▶ 自动播放'}
function parse(){stop();const raw=$('numbers').value.trim();const parts=raw.split(/[\s,，]+/).filter(Boolean);const err=$('error');err.textContent='';if(parts.length<(mode==='167'?2:3)||parts.length>18){err.textContent=`请输入 ${mode==='167'?'2':'3'}～18 个整数（用逗号或空格分隔）。`;valid=false;steps=[];render();return}
if(parts.some(p=>!/^[-+]?\d+$/.test(p)||!Number.isSafeInteger(Number(p)))){err.textContent='只支持安全范围内的整数，请检查输入。';valid=false;steps=[];render();return}
const arr=parts.map(Number);if(mode==='167'&&arr.some((v,i)=>i>0&&v<arr[i-1])){err.textContent='LeetCode 167 要求数组非递减排列，请先将数字排序。';valid=false;steps=[];render();return}
if(mode==='167'&&(!/^[-+]?\d+$/.test($('target').value.trim())||!Number.isSafeInteger(Number($('target').value.trim())))){err.textContent='target 必须是整数。';valid=false;steps=[];render();return}
steps=mode==='167'?solve167(arr,Number($('target').value.trim())):solve15(arr);at=0;valid=true;render()}
function render(){const st=steps[at];$('prev').disabled=!valid||at===0;$('next').disabled=!valid||at===steps.length-1;$('play').disabled=!valid||steps.length<2;$('range').max=Math.max(0,steps.length-1);$('range').value=at;$('progress').textContent=valid?`${at} / ${steps.length-1}`:'0 / 0';$('array').replaceChildren();$('found').replaceChildren();document.querySelectorAll('.code-line').forEach(el=>el.classList.toggle('active',!!st&&Number(el.dataset.line)===st.line));if(!st){$('status-title').textContent='等待有效输入';$('status-desc').textContent='请检查上方输入。';$('answer').textContent='—';return}
st.arr.forEach((n,index)=>{
  const el=document.createElement('div');
  const pointers=[];
  if(mode==='167'){
    if(index===st.i)pointers.push(['i','left-pointer']);
    if(index===st.j)pointers.push(['j','right-pointer']);
  }else{
    if(index===st.i)pointers.push(['i','fixed-pointer']);
    if(index===st.j)pointers.push(['j','left-pointer']);
    if(index===st.k)pointers.push(['k','right-pointer']);
  }
  let cls='num';
  if(pointers.length>1)cls+=' both';
  else if(pointers.length){cls+=' '+(pointers[0][1]==='fixed-pointer'?'fixed':pointers[0][1]==='right-pointer'?'right':'left')}
  el.className=cls;
  const markers=pointers.map(([name,style])=>`<span class="pointer ${style}">${name}</span>`).join('');
  el.innerHTML=`<span class="idx">${index}</span><span class="value">${escapeHTML(n)}</span><span class="markers">${markers}</span>`;
  $('array').append(el);
});
$('status-title').textContent=st.title;$('status-desc').textContent=st.desc;const result=mode==='167'?(st.found.length?st.found[0]:null):st.found;$('answer').textContent=result!==null?JSON.stringify(result):(mode==='167'&&st.kind==='end'?'无解':'尚未找到');if(mode==='15'){if(!st.found.length){const e=document.createElement('span');e.className='empty';e.textContent='暂时没有三元组';$('found').append(e)}else st.found.forEach(x=>{const e=document.createElement('span');e.className='chip';e.textContent=JSON.stringify(x);$('found').append(e)})}}
$('prev').onclick=()=>{stop();at=Math.max(0,at-1);render()};$('next').onclick=()=>{stop();at=Math.min(steps.length-1,at+1);render()};$('range').oninput=e=>{stop();at=Number(e.target.value);render()};$('reset').onclick=parse;$('play').onclick=()=>{if(timer){stop();return}if(at===steps.length-1)at=0;timer=setInterval(()=>{if(at<steps.length-1){at++;render()}else stop()},950);$('play').textContent='Ⅱ 暂停播放';render()};$('copy').onclick=async()=>{const v=$('answer').textContent;try{await navigator.clipboard.writeText(v);$('copy').textContent='已复制';setTimeout(()=>$('copy').textContent='复制',1100)}catch(e){$('copy').textContent='请手动复制';setTimeout(()=>$('copy').textContent='复制',1300)}};
$('numbers').addEventListener('change',parse);if(mode==='167')$('target').addEventListener('change',parse);parse();
