import {useEffect,useState} from 'react';
import {useAuth} from '../auth';
import {BookingList,ErrorNotice} from '../components';
export default function Bookings(){const {api}=useAuth();const [data,setData]=useState(null);const [error,setError]=useState('');useEffect(()=>{const c=new AbortController();api('/bookings/client',{signal:c.signal}).then(d=>setData(d.bookings)).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>c.abort();},[api]);return <section className="panel"><h1>My bookings</h1><ErrorNotice message={error}/>{data?<BookingList bookings={data}/>:!error&&<p role="status">Loading bookings…</p>}</section>;}
