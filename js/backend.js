(() => {
  const URL='https://nqaqoaorwgwfixlxutbj.supabase.co';
  const KEY='sb_publishable_FUpWl9SzzMbL6kcKu3Ga_A_gq7FGXl3';
  const sb=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const state={session:null,user:null,profile:null,leaderboard:[],ready:false};
  const listeners=new Set();
  const emit=()=>listeners.forEach(fn=>fn({...state}));
  const onChange=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
  async function loadProfile(){
    if(!state.user){state.profile=null;emit();return null;}
    const {data,error}=await sb.from('aim_profiles').select('*').eq('id',state.user.id).single();
    if(error){console.error(error);return null}
    state.profile=data;emit();return data;
  }
  async function init(){
    if(!sb){state.ready=true;emit();return}
    const {data}=await sb.auth.getSession();
    state.session=data.session||null;state.user=data.session?.user||null;
    if(state.user) await loadProfile();
    state.ready=true;emit();
    sb.auth.onAuthStateChange(async(_event,session)=>{
      state.session=session||null;state.user=session?.user||null;
      if(state.user) await loadProfile(); else {state.profile=null;emit()}
    });
  }
  async function signup(username,email,password){
    if(!sb) throw new Error('Backend unavailable');
    username=username.trim();
    if(!/^[A-Za-z0-9_]{3,20}$/.test(username)) throw new Error('Username: 3–20 Zeichen, nur A-Z, 0-9 und _.');
    const {data:dupe}=await sb.from('aim_leaderboard').select('username').ilike('username',username).limit(1);
    if(dupe?.length) throw new Error('Dieser Username ist schon vergeben.');
    const {data,error}=await sb.auth.signUp({email:email.trim(),password,options:{data:{username}}});
    if(error) throw error;
    return data;
  }
  async function login(email,password){const {data,error}=await sb.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;return data}
  async function logout(){const {error}=await sb.auth.signOut();if(error)throw error}
  async function rename(username){const {data,error}=await sb.rpc('rename_aim_user',{p_username:username.trim()});if(error)throw error;await loadProfile();return data}
  async function loadLeaderboard(limit=100){
    if(!sb) return [];
    const {data,error}=await sb.from('aim_leaderboard').select('*').order('rp',{ascending:false}).order('best_score',{ascending:false}).limit(limit);
    if(error) throw error;state.leaderboard=data||[];emit();return state.leaderboard;
  }
  async function submitRun(run){
    if(!state.session) return null;
    const {data,error}=await sb.functions.invoke('submit-aim-run',{body:run});
    if(error) throw error;
    if(data?.error) throw new Error(data.error);
    await loadProfile();
    return data;
  }
  window.AimBackend={state,onChange,init,signup,login,logout,rename,loadProfile,loadLeaderboard,submitRun,client:sb};
})();