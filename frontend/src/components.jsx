import {Link,Navigate,useLocation} from 'react-router-dom';
import {useAuth} from './auth';
export const money=value=>new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(Number(value)||0);
export function ErrorNotice({message}) {return message?<p className="notice error" role="alert">{message}</p>:null;}
export function ProtectedRoute({role,children}) {
 const {user}=useAuth();const location=useLocation();
 if(!user)return <Navigate to="/login" replace state={{from:location.pathname}}/>;
 if(role && user.role!==role)return <section className="panel"><h1>Access restricted</h1><p>This page is for {role} accounts.</p><Link to="/gigs">Browse gigs</Link></section>;
 return children;
}
export function GigList({gigs}) {
 if(!gigs.length)return <p className="empty">No gigs available yet. Check back soon.</p>;
 return <div className="grid">{gigs.map(gig=><article className="card" key={gig._id}><span className="tag">{gig.category||'General'}</span><h2><Link to={`/gigs/${gig._id}`}>{gig.title}</Link></h2><p>{gig.description}</p><div className="card-bottom"><strong>{money(gig.price)}</strong><Link to={`/gigs/${gig._id}`}>View service →</Link></div></article>)}</div>;
}
export function BookingList({bookings,freelancer=false}) {
 if(!bookings.length)return <p className="empty">No bookings yet.</p>;
 return <div className="table-wrap"><table><thead><tr><th>Service</th><th>{freelancer?'Client':'Freelancer'}</th><th>Amount</th><th>Status</th></tr></thead><tbody>{bookings.map(b=><tr key={b._id}><td>{b.gig?.title||'Unavailable gig'}</td><td>{(freelancer?b.client:b.freelancer)?.email||'Unavailable'}</td><td>{money(b.amount)}</td><td>{b.status}</td></tr>)}</tbody></table></div>;
}
