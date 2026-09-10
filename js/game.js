(() => {
  const modeNames={flick:'SNAP AIM',strafe:'STRAFE TRACKING',micro:'MICRO AIM',chaos:'RANDOM TRACKING'};
  const skins=['creeper','zombie','skeleton','slime','enderman','away','skin2','skin3','skin4','skin5'];
  const s={
    active:false,paused:false,lockedOnce:false,mode:'flick',duration:60,time:60,
    hits:0,shots:0,streak:0,bestStreak:0,reactions:[],spawnAt:0,last:0,frame:0,
    cameraYaw:0,cameraPitch:0,targetYaw:0,targetPitch:0,targetVYaw:0,targetVPitch:0,
    anchorYaw:0,anchorPitch:0,offscreenSince:0
  };
  const cfg={speed:100,size:100,lifetime:2,sensitivity:100,fov:90};
  const el={
    layer:()=>document.getElementById('gameLayer'),
    world:()=>document.querySelector('.game-world'),
    target:()=>document.getElementById('target'),
    hint:()=>document.getElementById('lockHint'),
    edge:()=>document.getElementById('edgeCue')
  };
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const angleDelta=(a,b)=>{let d=a-b;while(d>180)d-=360;while(d<-180)d+=360;return d};

  // Browser pointer-lock counts do not map perfectly 1:1 to Minecraft raw input.
  // Use Minecraft's sensitivity curve, then reduce the browser gain so 100% is controllable.
  const degreesPerCount=()=>{
    const n=clamp(cfg.sensitivity,0,200)/200;
    const vanilla=Math.pow(n*.6+.2,3)*8*.15;
    return clamp(vanilla*.35,.0035,.22);
  };

  const selectedSkin=()=>AimBackend.state.profile?.selected_target||AimRanks.getGuest().selected_target||'creeper';
  function applySkin(){
    const t=el.target();
    skins.forEach(x=>t.classList.remove('skin-'+x));
    t.classList.add('skin-'+selectedSkin());
  }

  function panWorld(){
    const w=el.world(); if(!w)return;
    const px=-((s.cameraYaw*8)%180);
    const py=clamp(s.cameraPitch*3,-50,50);
    w.style.setProperty('--camera-x',px+'px');
    w.style.setProperty('--camera-y',py+'px');
  }

  function render(){
    const t=el.target(),w=el.world(); if(!t||!w)return;
    const hfov=cfg.fov;
    const aspect=Math.max(.6,w.clientHeight/Math.max(1,w.clientWidth));
    const vfov=Math.max(42,hfov*aspect*.92);
    const dy=angleDelta(s.targetYaw,s.cameraYaw);
    const dp=s.targetPitch-s.cameraPitch;
    const x=50+(dy/(hfov/2))*50;
    const y=50+(dp/(vfov/2))*50;
    const visible=Math.abs(dy)<=hfov*.53&&Math.abs(dp)<=vfov*.53;

    t.style.left=x+'%';
    t.style.top=y+'%';
    t.classList.toggle('offscreen',!visible);

    const cue=el.edge();
    if(cue){
      cue.classList.toggle('show',!visible&&s.active&&!s.paused);
      if(!visible){
        const cx=clamp(x,5,95),cy=clamp(y,10,90);
        cue.style.left=cx+'%'; cue.style.top=cy+'%';
        if(Math.abs(x-50)>Math.abs(y-50)) cue.textContent=x<50?'◀':'▶';
        else cue.textContent=y<50?'▲':'▼';
      }
    }
    panWorld();

    if(!visible){
      if(!s.offscreenSince)s.offscreenSince=performance.now();
    }else s.offscreenSince=0;
  }

  function spawn(){
    const micro=s.mode==='micro';
    const yawRange=micro?7:(s.mode==='flick'?20:14);
    const pitchRange=micro?4:(s.mode==='chaos'?11:7);
    s.anchorYaw=s.cameraYaw;
    s.anchorPitch=s.cameraPitch;
    s.targetYaw=s.cameraYaw+rand(-yawRange,yawRange);
    s.targetPitch=clamp(s.cameraPitch+rand(-pitchRange,pitchRange),-45,45);
    s.spawnAt=performance.now();
    s.offscreenSince=0;
    const base=(s.mode==='chaos'?13:9)*(cfg.speed/100);
    s.targetVYaw=(Math.random()<.5?-1:1)*base;
    s.targetVPitch=s.mode==='chaos'?(Math.random()<.5?-1:1)*base*.52:0;
    render();
  }

  const avgReaction=()=>s.reactions.length?Math.round(s.reactions.reduce((a,b)=>a+b,0)/s.reactions.length):null;
  function ui(){
    const calc=AimRanks.computeRun({mode:s.mode,hits:s.hits,shots:s.shots,bestStreak:s.bestStreak,avgReaction:avgReaction()});
    document.getElementById('hudScore').textContent=calc.score.toLocaleString('de-DE');
    document.getElementById('hudAccuracy').textContent=(s.shots?s.hits/s.shots*100:100).toFixed(0)+'%';
    document.getElementById('hudReaction').textContent=s.reactions.length?Math.round(s.reactions.at(-1))+'ms':'—';
    document.getElementById('hudStreak').textContent='×'+s.streak;
    document.getElementById('hudTime').textContent=Math.max(0,s.time).toFixed(1);
  }

  function requestLock(){
    const world=el.world();
    if(!world||document.pointerLockElement===world)return;
    try{world.requestPointerLock?.({unadjustedMovement:true})}catch{world.requestPointerLock?.()}
    el.hint()?.classList.add('show');
  }

  function start(mode=s.mode,duration=+document.getElementById('duration').value){
    Object.assign(s,{
      active:true,paused:false,lockedOnce:false,mode,duration,time:duration,
      hits:0,shots:0,streak:0,bestStreak:0,reactions:[],last:performance.now(),
      cameraYaw:0,cameraPitch:0,offscreenSince:0
    });
    applySkin();
    const t=el.target();
    t.style.setProperty('--size',(cfg.size*(mode==='micro'?.74:1))/100);
    t.classList.add('visible');
    document.body.classList.add('in-game');
    el.layer().classList.add('active');
    el.layer().setAttribute('aria-hidden','false');
    document.getElementById('hudMode').textContent=modeNames[mode];
    spawn();ui();
    cancelAnimationFrame(s.frame);s.frame=requestAnimationFrame(loop);
    requestLock();
  }

  function isCrosshairOnTarget(){
    if(el.target().classList.contains('offscreen'))return false;
    const w=el.world().getBoundingClientRect(),t=el.target().getBoundingClientRect();
    const cx=w.left+w.width/2,cy=w.top+w.height/2;
    const tx=t.left+t.width/2,ty=t.top+t.height/2;
    const radius=Math.max(t.width,t.height)*.54;
    return Math.hypot(tx-cx,ty-cy)<=radius;
  }

  function shoot(){
    if(!s.active||s.paused||document.pointerLockElement!==el.world())return;
    s.shots++;
    if(isCrosshairOnTarget()){
      s.hits++;s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);
      const reaction=performance.now()-s.spawnAt;
      if(reaction>55&&reaction<10000)s.reactions.push(reaction);
      const marker=document.getElementById('hitMarker');
      marker.style.left='50%';marker.style.top='50%';marker.classList.remove('pop');void marker.offsetWidth;marker.classList.add('pop');
      const t=el.target();t.classList.remove('hit');void t.offsetWidth;t.classList.add('hit');
      spawn();
    }else{
      s.streak=0;
      const w=el.world();w.classList.remove('miss');void w.offsetWidth;w.classList.add('miss');
    }
    ui();
  }

  function moveTarget(dt){
    if(s.mode==='flick'||s.mode==='micro'){
      if((performance.now()-s.spawnAt)/1000>cfg.lifetime){s.streak=0;spawn()}
      return;
    }
    const boost=1+Math.min(.55,s.streak*.012);
    s.targetYaw+=s.targetVYaw*dt*boost;
    s.targetPitch+=s.targetVPitch*dt*boost;
    const yr=s.mode==='chaos'?18:14;
    const pr=s.mode==='chaos'?12:5;
    if(s.targetYaw<s.anchorYaw-yr||s.targetYaw>s.anchorYaw+yr){s.targetVYaw*=-1;s.targetYaw=clamp(s.targetYaw,s.anchorYaw-yr,s.anchorYaw+yr)}
    if(s.mode==='chaos'&&(s.targetPitch<s.anchorPitch-pr||s.targetPitch>s.anchorPitch+pr)){s.targetVPitch*=-1;s.targetPitch=clamp(s.targetPitch,s.anchorPitch-pr,s.anchorPitch+pr)}
    if(s.mode==='strafe')s.targetPitch=s.anchorPitch+Math.sin(performance.now()/520)*2.8;
  }

  function loop(now){
    if(!s.active)return;
    const dt=Math.min(.05,(now-s.last)/1000);s.last=now;
    if(!s.paused){
      s.time-=dt;moveTarget(dt);render();ui();
      // If the player wildly overshoots and loses the target, reset after a moment instead of leaving a dead run.
      if(s.offscreenSince&&performance.now()-s.offscreenSince>1200){s.streak=0;spawn()}
      if(s.time<=0){finish();return}
    }
    s.frame=requestAnimationFrame(loop);
  }

  function pause(exit=true){
    if(!s.active||s.paused)return;
    s.paused=true;document.getElementById('pauseOverlay').classList.add('active');
    if(exit&&document.pointerLockElement)document.exitPointerLock?.();
  }
  function resume(){
    if(!s.active)return;
    s.paused=false;s.last=performance.now();document.getElementById('pauseOverlay').classList.remove('active');requestLock();
  }
  function quit(){
    s.active=false;s.paused=false;cancelAnimationFrame(s.frame);
    if(document.pointerLockElement)document.exitPointerLock?.();
    document.getElementById('pauseOverlay').classList.remove('active');el.layer().classList.remove('active');document.body.classList.remove('in-game');el.target().classList.remove('visible');
  }

  async function finish(){
    s.active=false;cancelAnimationFrame(s.frame);if(document.pointerLockElement)document.exitPointerLock?.();el.target().classList.remove('visible');
    const run={mode:s.mode,duration:s.duration,hits:s.hits,shots:s.shots,bestStreak:s.bestStreak,avgReaction:avgReaction()};
    let result=AimRanks.computeRun(run),oldTier,newTier,totalRp,promoted=false,coinsGain=result.coinsGain,totalCoins;
    const accountRun=!!AimBackend.state.session;
    if(accountRun){
      try{
        const remote=await AimBackend.submitRun(run);result={...result,...remote};totalRp=remote.newRp;oldTier=remote.oldTier;newTier=remote.tier;promoted=remote.promoted;coinsGain=remote.coinsGain;totalCoins=remote.newCoins;
      }catch(e){
        window.AimUI?.toast('Run-Sync fehlgeschlagen: '+(e.message||e),'error');totalRp=Number(AimBackend.state.profile?.rp||0);oldTier=newTier=AimRanks.byRp(totalRp).name;promoted=false;result.rpGain=0;coinsGain=0;
      }
    }else{
      const g=AimRanks.getGuest(),old=AimRanks.byRp(g.rp).name,now=Math.min(AimRanks.MAX_RP,g.rp+result.rpGain),sessions=(g.sessions||0)+1;
      const newAvg=run.avgReaction==null?g.avg_reaction:(g.avg_reaction==null?run.avgReaction:Math.round((g.avg_reaction*Math.min(g.sessions||0,19)+run.avgReaction)/Math.min(sessions,20)));
      Object.assign(g,{rp:now,coins:(g.coins||0)+result.coinsGain,best_score:Math.max(g.best_score||0,result.score),total_hits:(g.total_hits||0)+s.hits,total_shots:(g.total_shots||0)+s.shots,sessions,best_streak:Math.max(g.best_streak||0,s.bestStreak),avg_reaction:newAvg});
      AimRanks.saveGuest(g);totalRp=now;totalCoins=g.coins;oldTier=old;newTier=AimRanks.byRp(now).name;promoted=oldTier!==newTier;
    }
    el.layer().classList.remove('active');document.body.classList.remove('in-game');
    window.AimUI?.showResults({...run,...result,totalRp,totalCoins,coinsGain,oldTier,newTier,promoted});window.AimUI?.refreshProfileUI();
  }

  function setConfig(next){Object.assign(cfg,next)}

  document.addEventListener('DOMContentLoaded',()=>{
    const h=document.createElement('div');h.id='lockHint';h.className='lock-hint';h.innerHTML='<b>CLICK TO AIM</b><span>Mouse = camera • Crosshair stays in the middle • Left click = hit</span>';el.layer().append(h);
    const edge=document.createElement('div');edge.id='edgeCue';edge.className='edge-cue';el.world().append(edge);

    el.world().addEventListener('mousedown',e=>{
      if(e.button!==0)return;
      if(document.pointerLockElement!==el.world()){requestLock();return}
      shoot();
    });
    el.target().style.pointerEvents='none';

    document.addEventListener('mousemove',e=>{
      if(!s.active||s.paused||document.pointerLockElement!==el.world())return;
      const step=degreesPerCount();
      s.cameraYaw+=e.movementX*step;
      s.cameraPitch=clamp(s.cameraPitch+e.movementY*step,-70,70);
      render();
    });

    document.addEventListener('pointerlockchange',()=>{
      const locked=document.pointerLockElement===el.world();
      if(locked){s.lockedOnce=true;h.classList.remove('show')}
      else if(s.active&&s.lockedOnce&&!s.paused)pause(false);
    });

    document.getElementById('pauseButton').onclick=()=>pause();
    document.getElementById('resumeButton').onclick=resume;
    document.getElementById('quitRunButton').onclick=()=>{quit();window.AimUI?.showView('train')};
  });

  window.AimGame={state:s,cfg,start,pause,resume,quit,setConfig,modeNames,applySkin};
})();