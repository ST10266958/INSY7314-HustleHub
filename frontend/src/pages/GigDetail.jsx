import {useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {useAuth} from '../auth';
import {ErrorNotice,money} from '../components';
export default function GigDetail(){
 const {id}=useParams();const {api,user}=useAuth();const [gig,setGig]=useState(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [confirmation,setConfirmation]=useState(null);
 useEffect(()=>{const c=new AbortController();setGig(null);setError('');setConfirmation(null);api(`/gigs/${id}`,{signal:c.signal}).then(d=>setGig(d.gig)).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>c.abort();},[id,api]);
 async function book(){if(busy||confirmation)return;setBusy(true);setError('');try{setConfirmation(await api('/bookings',{method:'POST',body:{gigId:id}}));}catch(e){setError(e.message);}finally{setBusy(false);}}
 const owner=typeof gig?.freelancer==='object'?gig.freelancer?._id:gig?.freelancer;const own=owner===(user?.id||user?._id);
 return <section className="panel"><Link to="/gigs">← All services</Link><ErrorNotice message={error}/>{!gig&&!error?<p role="status">Loading service…</p>:gig&&<><span className="tag">{gig.category||'General'}</span><h1>{gig.title}</h1><p className="description">{gig.description}</p><p>Offered by {gig.freelancer?.email||'a freelancer'}</p><h2>{money(gig.price)}</h2>{confirmation?<div className="notice" role="status"><h2>Booking confirmed</h2><p>Payment is simulated; no money was charged.</p><p>Booking reference: {confirmation.booking?._id}</p><p>Transaction reference: {confirmation.transaction?._id}</p><p>Recorded amount: {money(confirmation.transaction?.amount)}</p><Link to="/bookings">View my bookings</Link></div>:!user?<Link className="button" to="/login" state={{from:`/gigs/${id}`}}>Sign in to book</Link>:user.role!=='client'?<p>Only client accounts can book services.</p>:own?<p>You cannot book your own service.</p>:gig.isActive===false?<p>This service is no longer available.</p>:<><p className="hint">This creates a booking and a simulated transaction.</p><button onClick={book} disabled={busy}>{busy?'Confirming…':'Confirm booking'}</button></>}</> }</section>;
}
