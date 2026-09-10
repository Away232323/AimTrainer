(() => {
  const ladder=[['Copper I',0,'copper'],['Copper II',500,'copper'],['Copper III',1000,'copper'],['Iron I',1600,'iron'],['Iron II',2300,'iron'],['Iron III',3100,'iron'],['Gold I',4000,'gold'],['Gold II',5000,'gold'],['Gold III',6100,'gold'],['Diamond I',7300,'diamond'],['Diamond II',8600,'diamond'],['Diamond III',10000,'diamond'],['Elite I',11500,'elite'],['Elite II',13250,'elite'],['Champion I',15250,'champion'],['Master I',17500,'master']].map(([name,rp,group],index)=>({name,rp,group,index}));
  const byRp=rp=>[...ladder].reverse().find(r=>rp>=r.rp)||ladder[0],next=rp=>ladder.find(r=>r.rp>rp)||null;
  const progress=rp=>{const cur=byRp(rp),nxt=next(rp);if(!nxt)return{cur,nxt:null,pct:100,text:`${rp.toLocaleString()} RP • MAX RANK`};return{cur,nxt,pct:Math.max(0,Math.min(100,(rp-cur.rp)/(nxt.rp-cur.rp)*100)),text:`${rp.toLocaleString()} / ${nxt.rp.toLocaleString()} RP`}};
  const localKey='awayAimGuestV3';
  const defaultGuest={rp:0,coins:0,selected_target:'creeper',unlocked_targets:['creeper'],best_score:0,total_hits:0,total_shots:0,sessions:0,best_streak:0,avg_reaction:null};
  const getGuest=()=>{try{return{...defaultGuest,...JSON.parse(localStorage.getItem(localKey)||'{}')}}catch{return{...defaultGuest}}};
  const saveGuest=p=>localStorage.setItem(localKey,JSON.stringify(p));
  const computeRun=({mode,hits,shots,bestStreak,avgReaction})=>{const accuracy=shots?Math.round(hits/shots*10000)/100:0,rb=avgReaction==null?0:Math.max(0,Math.min(80,(420-avgReaction)*.32)),diff={flick:1,strafe:1.08,micro:1.13,chaos:1.2}[mode]||1;const score=Math.max(0,Math.round((hits*112+bestStreak*9+accuracy*13+rb*11)*diff)),raw=(hits*1.35+accuracy*.62+bestStreak*.58+rb*.75)*diff,rpGain=hits===0?0:Math.max(8,Math.min(260,Math.round(raw))),coinsGain=hits===0?0:Math.max(5,Math.min(180,Math.round((hits*.8+accuracy*.3+bestStreak*.45)*diff)));return{accuracy,score,rpGain,coinsGain}};
  window.AimRanks={ladder,byRp,next,progress,getGuest,saveGuest,computeRun,MAX_RP:17500};
})();