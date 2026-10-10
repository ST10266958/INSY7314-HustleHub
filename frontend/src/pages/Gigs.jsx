import {useEffect,useState} from 'react';
import {useAuth} from '../auth';
import {GigList,ErrorNotice} from '../components';
export default function Gigs(){
 const {api}=useAuth(); const [gigs,setGigs]=useState([]);const [query,setQuery]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [reload,setReload]=useState(0);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');api('/gigs',{signal:controller.signal}).then(d=>setGigs(d.gigs)).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[api,reload]);
 const filtered=gigs.filter(g=>`${g.title} ${g.category||''} ${g.description}`.toLowerCase().includes(query.toLowerCase()));
 return <><section className="hero"><span className="eyebrow">Made for your next move</span><h1>Great skills.<br/>Real opportunities.</h1><p>Discover independent talent and book the service you need.</p></section><section><div className="section-head"><h2>Explore services</h2><label className="search">Search gigs<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Design, writing, development…"/></label></div><ErrorNotice message={error}/>{error&&<button onClick={()=>setReload(r=>r+1)}>Try again</button>}{loading?<p role="status">Loading gigs…</p>:!error&&<GigList gigs={filtered}/>}</section></>;
}
