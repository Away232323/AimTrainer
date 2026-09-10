(() => {
const s=Aim.state,t=document.getElementById('practiceTarget'),a=document.getElementById('gameCanvas');
a.addEventListener('click',()=>{if(!s.active||s.paused)return;s.shots++;s.streak=0;s.clicks.push(performance.now());a.classList.remove('miss');void a.offsetWidth;a.classList.add('miss');Aim.updateHud()});
Aim.pause=()=>{if(!s.active)return;s.paused=true;t.classList.remove('visible');document.getElementById('pauseScreen').classList.add('visible')};
Aim.resume=()=>{if(!s.active)return;s.paused=false;s.last=performance.now();t.classList.add('visible');document.getElementById('pauseScreen').classList.remove('visible')};
document.getElementById('startButton').onclick=Aim.start;
document.getElementById('retryButton').onclick=Aim.start;
document.getElementById('quitButton').onclick=Aim.toMenu;
document.getElementById('menuButton').onclick=Aim.toMenu;
document.getElementById('resumeButton').onclick=Aim.resume;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&s.active)(s.paused?Aim.resume:Aim.pause)()});
})();