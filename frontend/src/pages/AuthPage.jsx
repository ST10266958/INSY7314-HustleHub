import {useState} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import {useAuth} from '../auth';
import {ErrorNotice} from '../components';
import {validateAuth,focusFirstInvalid,LIMITS} from '../validation';
export default function AuthPage({register=false}) {
 const {authenticate}=useAuth();const navigate=useNavigate();const location=useLocation();
 const [error,setError]=useState('');const [errors,setErrors]=useState({});const [busy,setBusy]=useState(false);
 const fieldProps=name=>({'aria-invalid':Boolean(errors[name]),'aria-describedby':errors[name]?`${name}-error`:undefined});
 const fieldError=name=>errors[name]?<p className="field-error" id={`${name}-error`}>{errors[name]}</p>:null;
 function change(event){const name=event.target.name;setErrors(previous=>{const next={...previous};delete next[name];return next;});setError('');}
 async function submit(event){
  event.preventDefault();if(busy)return;const form=event.currentTarget;const data=new FormData(form);
  const result=validateAuth(Object.fromEntries(data),{register});setErrors(result.errors);setError('');
  if(Object.keys(result.errors).length){setError(Object.values(result.errors).join(' '));focusFirstInvalid(form,result.errors);return;}
  setBusy(true);
  try{const user=await authenticate(register?'register':'login',result.values);const from=location.state?.from;navigate(from?.startsWith('/')&&!from.startsWith('//')?from:user.role==='freelancer'?'/dashboard':user.role==='admin'?'/admin':'/gigs',{replace:true});}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <section className="panel auth-panel"><span className="eyebrow">Your next opportunity</span><h1>{register?'Create your account':'Welcome back'}</h1><p>{register?'Find a service or turn your skills into income.':'Sign in to continue your hustle.'}</p><ErrorNotice message={error}/><form noValidate onSubmit={submit} onChange={change}><fieldset className="form-fields" disabled={busy}><label>Email<input name="email" type="email" autoComplete="email" required maxLength={LIMITS.email} {...fieldProps('email')}/></label>{fieldError('email')}<label>Password<input name="password" type="password" autoComplete={register?'new-password':'current-password'} required maxLength={LIMITS.password} {...fieldProps('password')}/></label>{fieldError('password')}{register&&<><p className="hint">8–128 characters, including uppercase, lowercase and a number.</p><label>Account type<select name="role" {...fieldProps('role')}><option value="client">Client — book services</option><option value="freelancer">Freelancer — offer services</option></select></label>{fieldError('role')}</>}<button disabled={busy} type="submit">{busy?'Please wait…':register?'Create account':'Sign in'}</button></fieldset></form><p>{register?'Already have an account?':'New to HustleHub+?'} <Link to={register?'/login':'/register'}>{register?'Sign in':'Create account'}</Link></p></section>;
}
