import {useState} from 'react';
import {Link} from 'react-router-dom';
import {request} from '../api';
import {ErrorNotice} from '../components';
import {validateForgot,focusFirstInvalid,LIMITS} from '../validation';
export default function ForgotPassword() {
 const [error,setError]=useState('');const [errors,setErrors]=useState({});const [busy,setBusy]=useState(false);const [sent,setSent]=useState(false);
 async function submit(event){
  event.preventDefault();if(busy)return;const form=event.currentTarget;
  const result=validateForgot(Object.fromEntries(new FormData(form)));setErrors(result.errors);setError('');
  if(Object.keys(result.errors).length){setError(Object.values(result.errors).join(' '));focusFirstInvalid(form,result.errors);return;}
  setBusy(true);
  try{await request('/auth/forgot-password',{method:'POST',body:result.values});setSent(true);}
  catch(e){setError(e.message);}finally{setBusy(false);}
 }
 if(sent) return <section className="panel auth-panel"><h1>Check your email</h1><p>If an account exists for that address, we have sent a link to reset your password. It expires in 15 minutes and can only be used once.</p><p><Link to="/login">Back to sign in</Link></p></section>;
 return <section className="panel auth-panel"><span className="eyebrow">Account recovery</span><h1>Reset your password</h1><p>Enter your email and we will send you a reset link.</p><ErrorNotice message={error}/><form noValidate onSubmit={submit}><fieldset className="form-fields" disabled={busy}><label>Email<input name="email" type="email" autoComplete="email" required maxLength={LIMITS.email} aria-invalid={Boolean(errors.email)}/></label><button disabled={busy} type="submit">{busy?'Please wait…':'Send reset link'}</button></fieldset></form><p><Link to="/login">Back to sign in</Link></p></section>;
}
