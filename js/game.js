(() => {
  const modeNames={flick:'REFLEX FLICK',strafe:'STRAFE LOCK',micro:'MICROSHOT',chaos:'CHAOS'};
  const s={active:false,paused:false,mode:'flick',duration:60,time:60,hits:0,shots:0,streak:0,bestStreak:0,reactions:[],spawnAt:0,last:0,x:50,y:50,vx:0,vy:0,frame:0};
  const cfg={speed:100,size:100,lifetime:2};
  const el={layer:()=>document.getElementById('gameLayer'),world:()=>document.querySelector('.game-world'),target:()=>document.getElementById('target')};
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const setTargetPosition=()=>{const t=el.target();t.style.left=s.x+'%';t.style.top=s.y+'%'};
  function spawn(){
    const margin=s.mode==='micro'?12:8;
    s.x=rand(margin,100-margin);s.y=rand(18,86);s.spawnAt=performance.now();
    const base=(s.mode==='chaos'?23:16)*(cfg.speed/100);
    s.vx=(Math.random()<.5?-1:1)*base;s.vy=0;
    if(s.mode==='chaos') s.vy=(Math.random()<.5?-1:1)*base*.68;
    setTargetPosition();
  }
  function ui(){
    const calc=AimRanks.computeRun({mode:s.mode,hits:s.hits,shots:s.shots,bestStreak:s.bestStreak,avgReaction:avgReaction()});
    document.getElementById('hudScore').textContent=calc.score.toLocaleString('de-DE');
    document.getElementById('hudAccuracy').textContent=(s.shots?s.hits/s.shots*100:100).toFixed(0)+'%';
    document.getElementById('hudReaction').textContent=s.reactions.length?Math.round(s.reactions.at(-1))+'ms':'—';
    document.getElementById('hudStreak').textContent='×'+s.streak;
    document.getElementById('hudTime').textContent=Math.max(0,s.time).toFixed(1);
  }
  const avgReaction=()=>s.reactions.length?Math.round(s.reactions.reduce((a,b)=>a+b,0)/s.reactions.length):null;
  function start(mode=s.mode,duration=+document.getElementById('duration').value){
    Object.assign(s,{active:true,paused:false,mode,duration,time:duration,hits:0,shots:0,streak:0,bestStreak:0,reactions:[],last:performance.now()});
    const t=el.target();t.style.setProperty('--size',(cfg.size*(mode==='micro'?.58:1))/100);t.classList.add('visible');
    document.body.classList.add('in-game');el.layer().classList.add('active');el.layer().setAttribute('aria-hidden','false');
    document.getElementById('hudMode').textContent=modeNames[mode];
    spawn();ui();cancelAnimationFrame(s.frame);s.frame=requestAnimationFrame(loop);
  }
  function hit(ev){
    if(!s.active||s.paused)return;ev.stopPropagation();s.shots++;s.hits++;s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);
    const reaction=performance.now()-s.spawnAt;if(reaction>55&&reaction<10000)s.reactions.push(reaction);
    const marker=document.getElementById('hitMarker');marker.style.left=ev.clientX+'px';marker.style.top=ev.clientY+'px';marker.classList.remove('pop');void marker.offsetWidth;marker.classList.add('pop');
    const t=el.target();t.classList.remove('hit');void t.offsetWidth;t.classList.add('hit');spawn();ui();
  }
  function miss(){if(!s.active||s.paused)return;s.shots++;s.streak=0;document.querySelector('.game-world').classList.remove('miss');void document.body.offsetWidth;document.querySelector('.game-world').classList.add('miss');ui()}
  function move(dt){
    if(s.mode==='flick'||s.mode==='micro'){
      if((performance.now()-s.spawnAt)/1000>cfg.lifetime){s.streak=0;spawn()}
      return;
    }
    const boost=1+Math.min(.75,s.streak*.018);s.x+=s.vx*dt*boost;s.y+=s.vy*dt*boost;
    if(s.x<7||s.x>93){s.vx*=-1;s.x=clamp(s.x,7,93)}
    if(s.mode==='chaos'&&(s.y<18||s.y>87)){s.vy*=-1;s.y=clamp(s.y,18,87)}
    if(s.mode==='strafe')s.y=48+Math.sin(performance.now()/430)*8;
    setTargetPosition();
  }
  function loop(now){
    if(!s.active)return;const dt=Math.min(.05,(now-s.last)/1000);s.last=now;
    if(!s.paused){s.time-=dt;move(dt);ui();if(s.time<=0){finish();return}}
    s.frame=requestAnimationFrame(loop);
  }
  function pause(){if(!s.active)return;s.paused=true;document.getElementById('pauseOverlay').classList.add('active')}
  function resume(){if(!s.active)return;s.paused=false;s.last=performance.now();document.getElementById('pauseOverlay').classList.remove('active')}
  function quit(){s.active=false;s.paused=false;cancelAnimationFrame(s.frame);document.getElementById('pauseOverlay').classList.remove('active');document.getElementById('gameLayer').classList.remove('active');document.body.classList.remove('in-game');el.target().classList.remove('visible')}
  async function finish(){
    s.active=false;cancelAnimationFrame(s.frame);el.target().classList.remove('visible');
    const run={mode:s.mode,duration:s.duration,hits:s.hits,shots:s.shots,bestStreak:s.bestStreak,avgReaction:avgReaction()};
    let result=AimRanks.computeRun(run), oldTier, newTier, totalRp, promoted=false;
    const accountRun=!!AimBackend.state.session;
    if(accountRun){
      try{const remote=await AimBackend.submitRun(run);if(remote){result={...result,...remote};totalRp=remote.newRp;oldTier=remote.oldTier;newTier=remote.tier;promoted=remote.promoted}}
      catch(e){
        window.AimUI?.toast('Run konnte nicht synchronisiert werden: '+(e.message||e),'error');
        totalRp=Number(AimBackend.state.profile?.rp||0);oldTier=newTier=AimRanks.byRp(totalRp).name;promoted=false;result.rpGain=0;
      }
    }
    if(!accountRun&&totalRp==null){
      const g=AimRanks.getGuest(),old=AimRanks.byRp(g.rp).name,now=Math.min(AimRanks.MAX_RP,g.rp+result.rpGain);
      const sessions=g.sessions+1,newAvg=run.avgReaction==null?g.avg_reaction:(g.avg_reaction==null?run.avgReaction:Math.round((g.avg_reaction*Math.min(g.sessions,19)+run.avgReaction)/Math.min(sessions,20)));
      Object.assign(g,{rp:now,best_score:Math.max(g.best_score,result.score),total_hits:g.total_hits+s.hits,total_shots:g.total_shots+s.shots,sessions,best_streak:Math.max(g.best_streak,s.bestStreak),avg_reaction:newAvg});AimRanks.saveGuest(g);
      totalRp=now;oldTier=old;newTier=AimRanks.byRp(now).name;promoted=oldTier!==newTier;
    }
    document.getElementById('gameLayer').classList.remove('active');document.body.classList.remove('in-game');
    window.AimUI?.showResults({...run,...result,totalRp,oldTier,newTier,promoted});window.AimUI?.refreshProfileUI();
  }
  function setConfig(next){Object.assign(cfg,next)}
  document.addEventListener('DOMContentLoaded',()=>{
    el.target().addEventListener('click',hit);document.querySelector('.game-world').addEventListener('click',miss);
    document.getElementById('pauseButton').onclick=pause;document.getElementById('resumeButton').onclick=resume;document.getElementById('quitRunButton').onclick=()=>{quit();window.AimUI?.showView('train')};
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&s.active)(s.paused?resume:pause)()});
  });
  window.AimGame={state:s,cfg,start,pause,resume,quit,setConfig,modeNames};
})();