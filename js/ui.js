(() => {
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  let selectedMode='flick';
  const currentProfile=()=>AimBackend.state.profile||AimRanks.getGuest();
  const rankClass=name=>(name||'Copper I').split(' ')[0].toLowerCase();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function toast(message,type='ok'){const el=document.createElement('div');el.className='toast '+type;el.textContent=message;$('#toastStack').append(el);setTimeout(()=>el.classList.add('show'),10);setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),250)},3200)}
  function showView(name){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));$$('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));if(name==='leaderboard')loadLeaderboard()}
  function openModal(id){$('#'+id).classList.add('active');$('#'+id).setAttribute('aria-hidden','false')}
  function closeModal(id){$('#'+id).classList.remove('active');$('#'+id).setAttribute('aria-hidden','true')}
  function setRankVisual(el,name){if(!el)return;['copper','iron','gold','diamond','elite','champion','master'].forEach(c=>el.classList.remove(c));el.classList.add(rankClass(name))}
  function refreshProfileUI(){
    const p=currentProfile(),rp=+p.rp||0,prog=AimRanks.progress(rp),account=!!AimBackend.state.session;
    $('#miniRankName').textContent=prog.cur.name;setRankVisual($('.mini-rank .rank-gem'),prog.cur.name);
    $('#heroTier').textContent=prog.cur.name;$('#heroRp').textContent=rp.toLocaleString('de-DE')+' RP';$('#heroSessions').textContent=(p.sessions||0).toLocaleString('de-DE');
    $('#heroBadgeName').textContent=prog.cur.name.toUpperCase();$('#heroBadgeProgress').textContent=prog.text;setRankVisual($('#heroBadge'),prog.cur.name);
    $('#progressTitle').textContent=prog.cur.name;$('#rankProgressBar').style.width=prog.pct+'%';$('#progressCurrent').textContent=rp.toLocaleString('de-DE')+' RP';$('#progressNext').textContent=prog.nxt?`${prog.nxt.name} • ${prog.nxt.rp.toLocaleString()} RP`:'MASTER I • MAX';
    $('#sideBestScore').textContent=(p.best_score||0).toLocaleString('de-DE');$('#sideBestStreak').textContent=(p.best_streak||0).toLocaleString('de-DE');$('#sideAccuracy').textContent=p.total_shots?`${(p.total_hits/p.total_shots*100).toFixed(1)}%`:'—';$('#sideReaction').textContent=p.avg_reaction?`${p.avg_reaction}ms`:'—';
    $('#accountStatePill').textContent=account?'SYNCED':'GUEST';$('#accountStatePill').classList.toggle('guest',!account);$('#sideAuthCta').textContent=account?'Progress synced to your account ✓':'Create account to enter global leaderboard →';
    $('#standingTier').textContent=prog.cur.name;setRankVisual($('#standingBadge'),prog.cur.name);
    if(account&&AimBackend.state.user){$('#authButtonLabel').textContent=AimBackend.state.profile?.username||'PROFILE';$('.avatar-dot').textContent=(AimBackend.state.profile?.username||'A')[0].toUpperCase();$('#accountStatePill').classList.remove('guest')}else{$('#authButtonLabel').textContent='ACCOUNT';$('.avatar-dot').textContent='G'}
    renderAccountPanel();
  }
  function renderAccountPanel(){
    const account=!!AimBackend.state.session;$('#signedOutAuth').classList.toggle('hidden',account);$('#signedInAuth').classList.toggle('hidden',!account);
    if(!account)return;const p=AimBackend.state.profile;if(!p)return;const tier=AimRanks.byRp(p.rp).name;
    $('#profileUsername').textContent=p.username;$('#profileEmail').textContent=AimBackend.state.user?.email||'—';$('#profileAvatar').textContent=p.username[0].toUpperCase();$('#profileTier').textContent=tier;$('#profileRp').textContent=`${p.rp.toLocaleString('de-DE')} RP`;setRankVisual($('#profileRankGem'),tier);$('#renameInput').value=p.username;
  }
  async function loadLeaderboard(){
    const box=$('#leaderRows');box.innerHTML='<div class="loading-row">Synchronisiere globale Rangliste…</div>';
    try{const rows=await AimBackend.loadLeaderboard(100);renderLeaderboard(rows);updateStanding(rows)}catch(e){box.innerHTML='<div class="loading-row error">Leaderboard konnte nicht geladen werden.</div>';toast(e.message||'Leaderboard error','error')}
  }
  function renderLeaderboard(rows){
    const q=$('#leaderSearch').value.trim().toLowerCase(), filtered=q?rows.filter(r=>r.username.toLowerCase().includes(q)):rows;
    $('#leaderRows').innerHTML=filtered.length?filtered.map(r=>{const pos=rows.indexOf(r)+1,acc=r.total_shots?(r.total_hits/r.total_shots*100).toFixed(1)+'%':'—';return `<div class="leader-row row ${pos<=3?'podium p'+pos:''}"><span class="place">${pos<=3?['','🥇','🥈','🥉'][pos]:'#'+pos}</span><span class="player-cell"><i class="player-avatar">${esc(r.username[0]?.toUpperCase())}</i><b>${esc(r.username)}</b></span><span class="tier-cell"><i class="rank-gem ${rankClass(r.tier)} tiny"></i><b>${esc(r.tier)}</b></span><span>${Number(r.rp).toLocaleString('de-DE')}</span><span>${Number(r.best_score||0).toLocaleString('de-DE')}</span><span>${acc}</span></div>`}).join(''):'<div class="loading-row">Keine Spieler gefunden.</div>';
  }
  function updateStanding(rows){
    if(!AimBackend.state.session){$('#standingPosition').textContent='GUEST';$('#standingText').textContent='Erstelle einen Account, damit dein Rank global sichtbar wird.';$('#standingAccountBtn').textContent='CREATE ACCOUNT';return}
    const name=AimBackend.state.profile?.username,pos=rows.findIndex(r=>r.username===name);$('#standingPosition').textContent=pos>=0?`#${pos+1} GLOBAL`:'UNRANKED';$('#standingText').textContent=pos>=0?`${name}, du bist aktuell Platz ${pos+1} von ${rows.length} geladenen Spielern.`:'Schließe eine Session ab, um deine Position zu aktualisieren.';$('#standingAccountBtn').textContent='VIEW PROFILE';
  }
  function renderRankRoad(){
    $('#rankRoad').innerHTML=AimRanks.ladder.map((r,i)=>{const next=AimRanks.ladder[i+1],span=next?next.rp-r.rp:0;return `<article class="rank-road-card ${r.group}"><div class="road-index">${String(i+1).padStart(2,'0')}</div><div class="rank-gem ${r.group} road"></div><div><small>${r.group.toUpperCase()} DIVISION</small><h3>${r.name}</h3><b>${r.rp.toLocaleString('de-DE')} RP</b><p>${next?`${span.toLocaleString('de-DE')} RP bis ${next.name}`:'Maximum Rank • Top of the ladder'}</p></div></article>`}).join('');
  }
  function showResults(data){
    $('#resultTitle').textContent=AimGame.modeNames[data.mode];$('#resultScore').textContent=data.score.toLocaleString('de-DE');$('#resultAccuracy').textContent=data.accuracy.toFixed(1)+'%';$('#resultHits').textContent=data.hits;$('#resultStreak').textContent=data.bestStreak;$('#resultReaction').textContent=data.avgReaction?data.avgReaction+'ms':'—';$('#resultRp').textContent='+'+data.rpGain+' RP';
    const grade=data.accuracy>=96&&data.hits>=35?'S':data.accuracy>=90?'A':data.accuracy>=78?'B':data.accuracy>=65?'C':'D';$('#resultGrade').textContent=grade;
    const prog=AimRanks.progress(data.totalRp);$('#resultRankName').textContent=prog.cur.name;$('#resultProgress').style.width=prog.pct+'%';$('#resultProgressText').textContent=prog.text;setRankVisual($('#resultRankGem'),prog.cur.name);
    $('#promotionBanner').classList.toggle('show',!!data.promoted);$('#promotionRank').textContent=data.newTier||prog.cur.name;openModal('resultOverlay');
  }
  function bindAuth(){
    $$('.auth-tabs button').forEach(b=>b.onclick=()=>{$$('.auth-tabs button').forEach(x=>x.classList.toggle('active',x===b));$$('.auth-form').forEach(f=>f.classList.toggle('active',f.id===(b.dataset.authTab==='login'?'loginForm':'signupForm')));$('#authHeading').textContent=b.dataset.authTab==='login'?'Welcome back.':'Join the ranked ladder.';$('#authMessage').textContent=''});
    $('#loginForm').onsubmit=async e=>{e.preventDefault();const m=$('#authMessage');m.textContent='Logging in…';try{await AimBackend.login($('#loginEmail').value,$('#loginPassword').value);m.textContent='';toast('Logged in — progress is now synced.');closeModal('authOverlay');refreshProfileUI()}catch(err){m.textContent=err.message||'Login failed'}};
    $('#signupForm').onsubmit=async e=>{e.preventDefault();const m=$('#authMessage');m.textContent='Creating account…';try{const d=await AimBackend.signup($('#signupUsername').value,$('#signupEmail').value,$('#signupPassword').value);if(d.session){toast('Account created — welcome to Ranked!');closeModal('authOverlay')}else{m.textContent='Account erstellt. Check deine E-Mail zur Bestätigung und logge dich danach ein.'}}catch(err){m.textContent=err.message||'Signup failed'}};
    $('#logoutButton').onclick=async()=>{try{await AimBackend.logout();toast('Logged out. Guest progress is still available locally.');closeModal('authOverlay');refreshProfileUI()}catch(e){$('#profileMessage').textContent=e.message}};
    $('#renameForm').onsubmit=async e=>{e.preventDefault();try{await AimBackend.rename($('#renameInput').value);toast('Username updated.');refreshProfileUI()}catch(err){$('#profileMessage').textContent=err.message||'Rename failed'}};
  }
  function bind(){
    $$('[data-nav]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();showView(b.dataset.nav)}));
    $$('.mode-card').forEach(c=>c.onclick=()=>{$$('.mode-card').forEach(x=>x.classList.remove('selected'));c.classList.add('selected');selectedMode=c.dataset.mode});
    $('#quickStart').onclick=()=>AimGame.start(selectedMode);document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!document.body.classList.contains('in-game')&&!$('.modal-layer.active'))AimGame.start(selectedMode)});
    $('#authButton').onclick=()=>openModal('authOverlay');$('#sideAuthCta').onclick=()=>openModal('authOverlay');$('#standingAccountBtn').onclick=()=>openModal('authOverlay');
    $('#settingsButton').onclick=()=>openModal('settingsOverlay');$$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));$$('.modal-layer').forEach(m=>m.addEventListener('mousedown',e=>{if(e.target===m&&!['pauseOverlay','resultOverlay'].includes(m.id))closeModal(m.id)}));
    const updateSettings=()=>{const speed=+$('#speed').value,size=+$('#targetSize').value,lifetime=+$('#lifetime').value/10;$('#speedOut').textContent=speed+'%';$('#sizeOut').textContent=size+'%';$('#lifetimeOut').textContent=lifetime.toFixed(1)+'s';AimGame.setConfig({speed,size,lifetime})};['speed','targetSize','lifetime'].forEach(id=>$('#'+id).addEventListener('input',updateSettings));updateSettings();
    $('#retryButton').onclick=()=>{closeModal('resultOverlay');AimGame.start(selectedMode)};$('#resultMenuButton').onclick=()=>{closeModal('resultOverlay');showView('train')};
    $('#refreshLeaderboard').onclick=loadLeaderboard;$('#leaderSearch').addEventListener('input',()=>renderLeaderboard(AimBackend.state.leaderboard));
    bindAuth();renderRankRoad();
  }
  document.addEventListener('DOMContentLoaded',async()=>{bind();AimBackend.onChange(()=>refreshProfileUI());await AimBackend.init();refreshProfileUI();AimBackend.loadLeaderboard(100).catch(()=>{});});
  window.AimUI={toast,showView,openModal,closeModal,refreshProfileUI,showResults,loadLeaderboard};
})();