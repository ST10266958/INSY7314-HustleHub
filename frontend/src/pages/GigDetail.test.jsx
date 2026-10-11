import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import GigDetail from './GigDetail';
import {useAuth} from '../auth';
jest.mock('../auth',()=>({useAuth:jest.fn()}));
const gig={_id:'507f1f77bcf86cd799439012',title:'Website design',price:500,description:'Build a website',isActive:true,freelancer:{_id:'freelancer1',email:'freelancer@example.test'}};
const api=jest.fn();
function setup(user){useAuth.mockReturnValue({api,user});api.mockImplementation(path=>Promise.resolve(path==='/bookings'?{booking:{_id:'booking1'},transaction:{_id:'transaction1',amount:500}}:{gig}));render(<MemoryRouter initialEntries={['/gigs/507f1f77bcf86cd799439012']} future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Routes><Route path="/gigs/:id" element={<GigDetail/>}/></Routes></MemoryRouter>);return userEvent.setup();}
beforeEach(()=>api.mockReset());
test('client booking displays booking and transaction confirmation',async()=>{const user=setup({id:'client1',role:'client'});await user.click(await screen.findByRole('button',{name:'Confirm booking'}));expect(api).toHaveBeenCalledWith('/bookings',{method:'POST',body:{gigId:'507f1f77bcf86cd799439012'}});expect(await screen.findByText('Booking confirmed')).toBeInTheDocument();expect(screen.getByText(/transaction1/)).toBeInTheDocument();expect(screen.getByText(/booking1/)).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Confirm booking'})).not.toBeInTheDocument();});
test('freelancer cannot initiate a booking',async()=>{setup({id:'freelancer1',role:'freelancer'});expect(await screen.findByText(/Only client accounts/)).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Confirm booking'})).not.toBeInTheDocument();});
test('anonymous user sees sign-in link instead of booking control',async()=>{setup(null);expect(await screen.findByRole('link',{name:'Sign in to book'})).toHaveAttribute('href','/login');});

test('malformed service route never sends a request',async()=>{useAuth.mockReturnValue({api,user:null});render(<MemoryRouter initialEntries={['/gigs/invalid']} future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Routes><Route path='/gigs/:id' element={<GigDetail/>}/></Routes></MemoryRouter>);expect(await screen.findByRole('alert')).toHaveTextContent('Invalid service reference');expect(api).not.toHaveBeenCalled();});
test('incomplete booking confirmation blocks automatic repeat booking',async()=>{const user=setup({id:'client1',role:'client'});const button=await screen.findByRole('button',{name:'Confirm booking'});api.mockResolvedValue({});await user.click(button);expect(await screen.findByRole('alert')).toHaveTextContent('Check My bookings');expect(screen.queryByRole('button',{name:'Confirm booking'})).not.toBeInTheDocument();expect(screen.getByRole('link',{name:'Check my bookings'})).toHaveAttribute('href','/bookings');});
