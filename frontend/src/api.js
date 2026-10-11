import { API_URL } from './config';
export class ApiError extends Error { constructor(message,status){ super(message); this.status=status; } }
export async function request(path,{token,method='GET',body,signal}={}) {
  let response;
  try { response=await fetch(`${API_URL.replace(/\/$/,'')}${path}`, {method,signal,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})}); }
  catch(error){ if(error.name==='AbortError') throw error; throw new ApiError('Cannot reach the API. Check that the backend is running and its HTTPS certificate is trusted.',0); }
  const payload=await response.json().catch(()=>null);
  if(!response.ok) {
    const messages={400:'Check your input and try again.',401:'Your session is invalid or expired. Please sign in again.',403:'Your account cannot perform this action.',404:'The requested item was not found.',409:'This action conflicts with an existing record.',429:'Too many requests. Please wait before trying again.'};
    // Never expose server stack traces or raw response bodies.
    const authMessage=response.status===401&&path==='/auth/login'?'Invalid email or password.':response.status===409&&path==='/auth/register'?'An account with this email already exists. Please sign in.':null;
    throw new ApiError(authMessage || messages[response.status] || 'Something went wrong. Please try again later.',response.status);
  }
  if(!payload || payload.success!==true) throw new ApiError('The API returned an unexpected response.',response.status);
  return payload.data;
}
