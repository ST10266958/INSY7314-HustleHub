import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {request} from '../api';
import {ErrorNotice} from '../components';
import {validateReset,focusFirstInvalid,LIMITS} from '../validation';
const readToken=()=>new URLSearchParams(window.location.hash.replace(/^#/,'')).get('token')||'';
export default function ResetPassword() {
 // The token lives in the URL fragment. Keep it in memory and strip it from the address bar.
 const [token]=useState(readToken);
 const [error,setError]=useState('');const [errors,setErrors]=useState({});const [busy,setBusy]=useState(false);const [done,setDone]=useState(false);
 useEffect(()=>{if(window.location.hash) window.history.replaceState(null,'',window.location.pathname);},[]);
 const fieldError=name=>errors[name]?<p className="field-error" id={`${name}-error`}>{errors[name]}</p>:null;
 async function submit(event){
  event.preventDefault();if(busy)return;const form=event.currentTarget;
  const result=validateReset(Object.fromEntries(new FormData(form)));setErrors(result.errors);setError('');
  if(Object.keys(result.errors).length){setError(Object.values(result.errors).join(' '));focusFirstInvalid(form,result.errors);return;}
  setBusy(true);
  try{await request('/auth/reset-password',{method:'POST',body:{token,password:result.values.password}});setDone(true);}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 if(done) return <section className="panel auth-panel"><h1>Password updated</h1><p>Your password has been changed and any lockout on your account has been cleared.</p><p><Link className="button" to="/login">Sign in</Link></p></section>;
 if(!token) return <section className="panel auth-panel"><h1>Reset link missing</h1><p>Open the link from your email, or request a new one.</p><p><Link to="/forgot-password">Request a new link</Link></p></section>;
 return <section className="panel auth-panel"><span className="eyebrow">Account recovery</span><h1>Choose a new password</h1><ErrorNotice message={error}/><form noValidate onSubmit={submit}><fieldset className="form-fields" disabled={busy}><label>New password<input name="password" type="password" autoComplete="new-password" required maxLength={LIMITS.password} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password?'password-error':undefined}/></label>{fieldError('password')}<p className="hint">8–128 characters, including uppercase, lowercase and a number.</p><label>Confirm new password<input name="confirm" type="password" autoComplete="new-password" required maxLength={LIMITS.password} aria-invalid={Boolean(errors.confirm)} aria-describedby={errors.confirm?'confirm-error':undefined}/></label>{fieldError('confirm')}<button disabled={busy} type="submit">{busy?'Please wait…':'Update password'}</button></fieldset></form></section>;
}
