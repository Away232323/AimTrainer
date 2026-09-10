(() => {
const s=Aim.state;
Aim.move=(dt,now)=>{const b=Aim.bounds();if(s.mode==='flick'){if(now-s.spawnTime>Aim.config.lifetime*100){s.streak=0;Aim.place()}return}s.x+=s.vx*dt;if(s.mode==='strafe')s.y+=Math.sin(now/260)*.35;else s.y+=s.vy*dt;if(s.x<b.left){s.x=b.left;s.vx=Math.abs(s.vx)}if(s.x>b.right){s.x=b.right;s.vx=-Math.abs(s.vx)}if(s.y<b.top){s.y=b.top;s.vy=Math.abs(s.vy)}if(s.y>b.bottom){s.y=b.bottom;s.vy=-Math.abs(s.vy)}Aim.position()};
function frame(now){const dt=Math.min(.04,(now-s.last)/1000);s.last=now;if(s.active&&!s.paused){s.time-=dt;s.elapsed+=dt;s.clicks=s.clicks.filter(t=>now-t<1000);Aim.move(dt,now);Aim.updateHud();if(s.time<=0)Aim.finish()}requestAnimationFrame(frame)}
window.addEventListener('resize',()=>{if(s.active)Aim.place()});
requestAnimationFrame(frame);
})();