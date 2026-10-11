import {useEffect,useState} from 'react';
import {useAuth} from '../auth';
import {BookingList,ErrorNotice} from '../components';
import {readCollection} from '../validation';
export default function Bookings(){
 const {api}=useAuth();const [data,setData]=useState(null);const [error,setError]=useState('');const [retry,setRetry]=useState(0);
 useEffect(()=>{const c=new AbortController();setData(null);setError('');api('/bookings/client',{signal:c.signal}).then(d=>{if(!c.signal.aborted)setData(readCollection(d,'bookings'));}).catch(e=>{if(e.name!=='AbortError'&&!c.signal.aborted)setError(e.message);});return()=>c.abort();},[api,retry]);
 return <section className="panel"><h1>My bookings</h1><ErrorNotice message={error}/>{error&&<button type="button" onClick={()=>setRetry(value=>value+1)}>Try again</button>}{data?<BookingList bookings={data}/>:!error&&<p role="status">Loading bookings…</p>}</section>;
}
