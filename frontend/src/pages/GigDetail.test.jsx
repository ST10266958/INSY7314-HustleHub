import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import GigDetail from './GigDetail';
import {useAuth} from '../auth';
jest.mock('../auth',()=>({useAuth:jest.fn()}));
const gig={_id:'gig1',title:'Website design',price:500,description:'Build a website',isActive:true,freelancer:{_id:'freelancer1',email:'freelancer@example.test'}};
const api=jest.fn();
function setup(user){useAuth.mockReturnValue({api,user});api.mockImplementation(path=>Promise.resolve(path==='/bookings'?{booking:{_id:'booking1'},transaction:{_id:'transaction1',amount:500}}:{gig}));render(<MemoryRouter initialEntries={['/gigs/gig1']} future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Routes><Route path="/gigs/:id" element={<GigDetail/>}/></Routes></MemoryRouter>);return userEvent.setup();}
beforeEach(()=>api.mockReset());
test('client booking displays booking and transaction confirmation',async()=>{const user=setup({id:'client1',role:'client'});await user.click(await screen.findByRole('button',{name:'Confirm booking'}));expect(api).toHaveBeenCalledWith('/bookings',{method:'POST',body:{gigId:'gig1'}});expect(await screen.findByText('Booking confirmed')).toBeInTheDocument();expect(screen.getByText(/transaction1/)).toBeInTheDocument();expect(screen.getByText(/booking1/)).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Confirm booking'})).not.toBeInTheDocument();});
test('freelancer cannot initiate a booking',async()=>{setup({id:'freelancer1',role:'freelancer'});expect(await screen.findByText(/Only client accounts/)).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Confirm booking'})).not.toBeInTheDocument();});
test('anonymous user sees sign-in link instead of booking control',async()=>{setup(null);expect(await screen.findByRole('link',{name:'Sign in to book'})).toHaveAttribute('href','/login');});
