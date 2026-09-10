(() => {
  const bind = (id, outId, key, format) => {
    const input = document.getElementById(id);
    const output = document.getElementById(outId);
    const paint = () => {
      const min = +input.min || 0, max = +input.max || 100;
      const pct = (+input.value - min) / (max - min) * 100;
      input.style.background = `linear-gradient(90deg,var(--accent) ${pct}%,#313741 ${pct}%)`;
    };
    input.value = Aim.config[key]; output.value = format(Aim.config[key]); paint();
    input.addEventListener('input', () => {
      Aim.config[key] = +input.value; output.value = format(Aim.config[key]); paint();
      localStorage.setItem('awayAimTrainerConfig', JSON.stringify(Aim.config));
      if (key === 'size') Aim.applySize();
    });
  };
  Aim.applySize = () => document.getElementById('practiceTarget').style.setProperty('--target-scale', Aim.config.size / 100);
  bind('speed','speedValue','speed',v=>v+'%');
  bind('lifetime','lifetimeValue','lifetime',v=>(v/10).toFixed(1)+'s');
  bind('targetSize','targetSizeValue','size',v=>v+'%');
  bind('duration','durationValue','duration',v=>v+'s');
  document.querySelectorAll('.mode-card').forEach(card => card.addEventListener('click', () => {
    Aim.state.mode = card.dataset.mode;
    document.querySelectorAll('.mode-card').forEach(c => c.classList.toggle('selected', c === card));
    Aim.showBest();
  }));
  Aim.applySize(); Aim.showBest();
})();