import {useEffect,useState} from 'react';
import {useAuth} from '../auth';
import {ErrorNotice,money} from '../components';
import {readCollection,isMongoId} from '../validation';

const TABS=[
  {key:'users',label:'Users'},
  {key:'gigs',label:'Gigs'},
  {key:'bookings',label:'Bookings'},
  {key:'transactions',label:'Transactions'},
];
const date=value=>value?new Date(value).toLocaleDateString('en-ZA'):'—';

function Table({head,rows,empty}){
  if(!rows.length)return <p className="empty">{empty}</p>;
  return <div className="table-wrap"><table><thead><tr>{head.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows}</tbody></table></div>;
}

export default function AdminDashboard(){
  const {api}=useAuth();
  const [data,setData]=useState(null);
  const [tab,setTab]=useState('users');
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);
  const [deleting,setDeleting]=useState(null);
  const [revision,setRevision]=useState(0);

  useEffect(()=>{
    const c=new AbortController();
    setError('');
    Promise.all([
      api('/admin/users',{signal:c.signal}),
      api('/admin/gigs',{signal:c.signal}),
      api('/admin/bookings',{signal:c.signal}),
      api('/admin/transactions',{signal:c.signal}),
    ]).then(([u,g,b,t])=>{
      if(c.signal.aborted)return;
      setData({
        users:readCollection(u,'users'),
        gigs:readCollection(g,'gigs'),
        bookings:readCollection(b,'bookings'),
        transactions:readCollection(t,'transactions'),
      });
    }).catch(e=>{if(e.name!=='AbortError'&&!c.signal.aborted)setError(e.message);});
    return()=>c.abort();
  },[api,revision]);

  async function removeGig(){
    if(busy)return;
    if(!deleting||!isMongoId(deleting._id)){setError('This gig has an invalid reference. Refresh the dashboard before removing it.');return;}
    setBusy(true);setError('');setNotice('');
    try{
      await api(`/admin/gigs/${deleting._id}`,{method:'DELETE'});
      setDeleting(null);setNotice('Gig removed.');setRevision(r=>r+1);
    }catch(e){setError(e.message);}
    finally{setBusy(false);}
  }

  const revenue=data?data.transactions.reduce((sum,t)=>sum+t.amount,0):0;
  const counts=data?{users:data.users.length,gigs:data.gigs.length,bookings:data.bookings.length,transactions:data.transactions.length}:{};

  return <>
    <div className="section-head">
      <div><span className="eyebrow">Platform oversight</span><h1>Admin dashboard</h1></div>
      <button className="secondary" onClick={()=>{setError('');setNotice('');setData(null);setRevision(r=>r+1);}} disabled={!data&&!error}>Refresh</button>
    </div>
    <ErrorNotice message={error}/>
    {notice&&<p role="status" className="notice">{notice}</p>}
    {!data&&!error&&<p role="status">Loading dashboard…</p>}
    {data&&<>
      <div className="stats">
        <div className="card"><span>Transaction volume</span><strong>{money(revenue)}</strong></div>
        <div className="card"><span>Users</span><strong>{counts.users}</strong></div>
        <div className="card"><span>Gigs</span><strong>{counts.gigs}</strong></div>
      </div>
      {deleting&&<section className="notice" aria-label="Confirm gig removal">
        <h2>Remove “{deleting.title}”?</h2>
        <p>This removes the gig for everyone and cannot be undone. Existing bookings for it will show as “Unavailable gig”. The removal is recorded in the server log.</p>
        <div className="actions"><button className="danger" onClick={removeGig} disabled={busy}>{busy?'Removing…':'Confirm removal'}</button><button className="secondary" disabled={busy} onClick={()=>setDeleting(null)}>Cancel</button></div>
      </section>}
      <section className="panel">
        <div className="tabs" role="tablist" aria-label="Admin sections">
          {TABS.map(t=><button key={t.key} type="button" role="tab" id={`tab-${t.key}`} aria-selected={tab===t.key} aria-controls="admin-panel" className={tab===t.key?'tab active':'tab secondary'} onClick={()=>setTab(t.key)}>{t.label} ({counts[t.key]})</button>)}
        </div>
        <div id="admin-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab==='users'&&<Table head={['Email','Role','Joined']} empty="No users yet." rows={data.users.map(u=><tr key={u._id}><td>{u.email}</td><td>{u.role}</td><td>{date(u.createdAt)}</td></tr>)}/>}
          {tab==='gigs'&&<Table head={['Service','Freelancer','Price','Status','Action']} empty="No gigs yet." rows={data.gigs.map(g=><tr key={g._id}><td>{g.title}</td><td>{g.freelancer?.email||'Unavailable'}</td><td>{money(g.price)}</td><td>{g.isActive?'Active':'Inactive'}</td><td><button type="button" className="danger" disabled={busy} onClick={()=>{setNotice('');setDeleting(g);}} aria-label={`Remove ${g.title}`}>Remove</button></td></tr>)}/>}
          {tab==='bookings'&&<Table head={['Service','Client','Freelancer','Amount','Status','Date']} empty="No bookings yet." rows={data.bookings.map(b=><tr key={b._id}><td>{b.gig?.title||'Unavailable gig'}</td><td>{b.client?.email||'Unavailable'}</td><td>{b.freelancer?.email||'Unavailable'}</td><td>{money(b.amount)}</td><td>{b.status}</td><td>{date(b.createdAt)}</td></tr>)}/>}
          {tab==='transactions'&&<Table head={['Client','Freelancer','Amount','Status','Date']} empty="No transactions yet." rows={data.transactions.map(t=><tr key={t._id}><td>{t.client?.email||'Unavailable'}</td><td>{t.freelancer?.email||'Unavailable'}</td><td>{money(t.amount)}</td><td>{t.status}</td><td>{date(t.createdAt)}</td></tr>)}/>}
        </div>
      </section>
    </>}
  </>;
}
