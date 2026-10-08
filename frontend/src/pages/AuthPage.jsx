import {useState} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import {useAuth} from '../auth';
import {ErrorNotice} from '../components';
export default function AuthPage({register=false}) {
 const {authenticate}=useAuth();const navigate=useNavigate();const location=useLocation();
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function submit(event){
  event.preventDefault(); if(busy)return;setError('');
  const form=new FormData(event.currentTarget);const email=String(form.get('email')).trim();const password=String(form.get('password'));
  if(register && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(password)){setError('Use 8–128 characters with uppercase, lowercase and a number.');return;}
  setBusy(true);
  try{const user=await authenticate(register?'register':'login',{email,password,...(register?{role:form.get('role')}:{})}); const from=location.state?.from;navigate(from?.startsWith('/')&&!from.startsWith('//')?from:user.role==='freelancer'?'/dashboard':'/gigs',{replace:true});}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <section className="panel auth-panel"><span className="eyebrow">Your next opportunity</span><h1>{register?'Create your account':'Welcome back'}</h1><p>{register?'Find a service or turn your skills into income.':'Sign in to continue your hustle.'}</p><ErrorNotice message={error}/><form onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>Password<input name="password" type="password" autoComplete={register?'new-password':'current-password'} required maxLength={128}/></label>{register&&<><p className="hint">8–128 characters, including uppercase, lowercase and a number.</p><label>Account type<select name="role"><option value="client">Client — book services</option><option value="freelancer">Freelancer — offer services</option></select></label></>}<button disabled={busy} type="submit">{busy?'Please wait…':register?'Create account':'Sign in'}</button></form><p>{register?'Already have an account?':'New to HustleHub+?'} <Link to={register?'/login':'/register'}>{register?'Sign in':'Create account'}</Link></p></section>;
}
