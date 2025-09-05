const topRow = [3,6,9,12,15,18,21,24,27,30,33,36];
const midRow = [2,5,8,11,14,17,20,23,26,29,32,35];
const botRow = [1,4,7,10,13,16,19,22,25,28,31,34];

const redNums = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const blackNums = new Set([2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35]);

const betOrder = ["LOW","EVEN","RED","BLACK","ODD","HIGH"];
const startingBets = ["LOW","EVEN","RED","BLACK","ODD","HIGH"];
const stepMultipliers = [2,3,5,5,10,10,15,20,25,35,45,60];

const numbersGrid = document.getElementById("numbersGrid");
const zeroBtn = document.getElementById("zeroBtn");
const betUnitInput = document.getElementById("betUnit");
const resetBtn = document.getElementById("resetBtn");
const deleteBtn = document.getElementById("deleteBtn");
const playersBody = document.getElementById("playersBody");
const majorityBetEl = document.getElementById("majorityBet");
const majorityAmountEl = document.getElementById("majorityAmount");
const lastNumbersEl = document.getElementById("lastNumbers");

let betUnit = parseFloat(betUnitInput.value) || 10;
let betSteps = stepMultipliers.map(m => m * betUnit);
let players = [];
let spinHistory = [];

function init(){
  betUnit = parseFloat(betUnitInput.value) || 10;
  betSteps = stepMultipliers.map(m => m * betUnit);
  players = startingBets.map((bt, i) => ({
    id:i+1,currentBetType:bt,stepIndex:0,doubled:false,betAmount:betSteps[0],history:[]
  }));
  renderNumbers();
  renderPlayers();
  updateMajority();
  updateLastNumbers();
}

function renderNumbers(){
  numbersGrid.innerHTML = "";
  topRow.forEach(n=>numbersGrid.appendChild(createBtn(n)));
  midRow.forEach(n=>numbersGrid.appendChild(createBtn(n)));
  botRow.forEach(n=>numbersGrid.appendChild(createBtn(n)));
  zeroBtn.onclick=()=>handleSpin(0);
}

function createBtn(n){
  const btn=document.createElement("button");
  btn.className="number-btn "+(n===0?"green":(redNums.has(n)?"red":"black"));
  btn.textContent=n;
  btn.onclick=()=>handleSpin(n);
  return btn;
}

function handleSpin(num){
  spinHistory.push(num);
  if(spinHistory.length>100)spinHistory.shift();
  for(let p of players){
    const won = checkWin(p.currentBetType,num);
    p.history.push(won?"W":"L");
    if(won){
      if(!p.doubled){p.betAmount*=2;p.doubled=true;}
      else{p.stepIndex=0;p.betAmount=betSteps[0];p.doubled=false;}
      p.currentBetType=startingBets[p.id-1];
    }else{
      p.stepIndex=Math.min(p.stepIndex+1,betSteps.length-1);
      p.betAmount=betSteps[p.stepIndex];
      p.doubled=false;
      const idx=betOrder.indexOf(p.currentBetType);
      p.currentBetType=betOrder[(idx+1)%betOrder.length];
    }
  }
  renderPlayers();updateMajority();updateLastNumbers();
}

function checkWin(betType,num){
  if(num===0)return false;
  if(betType==="LOW")return num<=18;
  if(betType==="HIGH")return num>=19;
  if(betType==="EVEN")return num%2===0;
  if(betType==="ODD")return num%2===1;
  if(betType==="RED")return redNums.has(num);
  if(betType==="BLACK")return blackNums.has(num);
  return false;
}

function renderPlayers(){
  playersBody.innerHTML="";
  const lastArr=players.map(p=>sinceLast(p.history));
  const twoArr=players.map(p=>sinceTwo(p.history));
  const maxLast=Math.max(...lastArr);const maxTwo=Math.max(...twoArr);
  players.forEach((p,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>Player ${p.id}</td>
      <td>${p.currentBetType}</td>
      <td>${p.betAmount}</td>
      <td class="${lastArr[i]===maxLast&&maxLast>0?'highlight-last':''}">${lastArr[i]}</td>
      <td class="${twoArr[i]===maxTwo&&maxTwo>0?'highlight-two':''}">${twoArr[i]}</td>
    `;
    playersBody.appendChild(tr);
  });
}

function sinceLast(h){let c=0;for(let i=h.length-1;i>=0;i--){if(h[i]==="W")break;if(h[i]==="L")c++;}return c;}
function sinceTwo(h){let c=0;for(let i=h.length-1;i>=0;i--){if(h[i]==="W"&&i>0&&h[i-1]==="W")break;if(h[i]==="L")c++;}return c;}

function updateMajority(){
  const counts={},amts={};
  players.forEach(p=>{
    counts[p.currentBetType]=(counts[p.currentBetType]||0)+1;
    amts[p.currentBetType]=amts[p.currentBetType]||[];
    amts[p.currentBetType].push(p.betAmount);
  });
  const max=Math.max(...Object.values(counts));const winners=Object.keys(counts).filter(t=>counts[t]===max);
  if(max<=1||winners.length!==1){majorityBetEl.textContent="NO BET";majorityAmountEl.textContent="0";return;}
  const t=winners[0];majorityBetEl.textContent=t;majorityAmountEl.textContent=Math.max(...amts[t]);
}

function updateLastNumbers(){
  const last10=spinHistory.slice(-10).reverse();
  lastNumbersEl.textContent=last10.join(", ");
}

function resetAll(){init();spinHistory=[];updateLastNumbers();}
function deleteLast(){
  if(spinHistory.length===0)return;
  spinHistory.pop();players.forEach(p=>p.history.pop());
  renderPlayers();updateMajority();updateLastNumbers();
}

betUnitInput.addEventListener("input",()=>{
  betUnit=parseFloat(betUnitInput.value)||10;
  betSteps=stepMultipliers.map(m=>m*betUnit);
  players.forEach(p=>p.betAmount=betSteps[p.stepIndex]);
  renderPlayers();updateMajority();
});
resetBtn.addEventListener("click",resetAll);
deleteBtn.addEventListener("click",deleteLast);

init();
