(() => {
const s=Aim.state,t=document.getElementById('practiceTarget');
t.addEventListener('click',e=>{
 if(!s.active||s.paused)return;e.stopPropagation();const now=performance.now();
 s.shots++;s.success++;s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);s.clicks.push(now);s.reactions.push(now-s.spawnTime);
 s.score+=100+Math.min(120,s.streak*3);
 t.classList.remove('success');void t.offsetWidth;t.classList.add('success');
 if(s.mode==='flick')Aim.place();else{const v=180*(Aim.config.speed/100)*(1+Math.min(.7,s.streak*.012));s.vx=(Math.random()>.5?1:-1)*v;if(s.mode==='combo')s.vy=(Math.random()>.5?1:-1)*v*.72;s.spawnTime=now}
 Aim.updateHud();
});
})();