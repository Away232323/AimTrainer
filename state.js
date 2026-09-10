window.Aim = window.Aim || {};
Aim.state = { mode: 'flick', active: false, paused: false, score: 0, success: 0, shots: 0, streak: 0, bestStreak: 0, time: 60, elapsed: 0, clicks: [], reactions: [], x: 300, y: 300, vx: 180, vy: 120, last: performance.now(), spawnTime: 0 };
Aim.config = { speed: 100, lifetime: 25, size: 100, duration: 60 };
Aim.best = { flick: 0, strafe: 0, combo: 0 };
try { Aim.config = { ...Aim.config, ...JSON.parse(localStorage.getItem('awayAimTrainerConfig') || '{}') }; } catch (e) {}
try { Aim.best = { ...Aim.best, ...JSON.parse(localStorage.getItem('awayAimTrainerBest') || '{}') }; } catch (e) {}
Aim.random = (a, b) => a + Math.random() * (b - a);
Aim.bounds = () => ({ left: 80, right: innerWidth - 80, top: 125, bottom: innerHeight - 90 });
Aim.showBest = () => {
  document.getElementById('bestScore').textContent = (Aim.best[Aim.state.mode] || 0).toLocaleString('de-DE');
  document.getElementById('bestMode').textContent = Aim.state.mode.toUpperCase();
};