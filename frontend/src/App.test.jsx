import {render,screen,within} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import App from './App';
import {useAuth} from './auth';
jest.mock('./auth',()=>({useAuth:jest.fn()}));
jest.mock('./pages/Gigs',()=>()=> <p>Services page</p>);
jest.mock('./pages/GigDetail',()=>()=> <p>Service detail</p>);
jest.mock('./pages/Dashboard',()=>()=> <p>Dashboard page</p>);
jest.mock('./pages/Bookings',()=>()=> <p>Bookings page</p>);
jest.mock('./pages/AuthPage',()=>()=> <p>Authentication page</p>);
function setup(user=null){useAuth.mockReturnValue({user,logout:jest.fn()});render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><App/></MemoryRouter>);return within(screen.getByRole('contentinfo'));}
test('footer has working navigation and no assessment copy',()=>{const footer=setup();expect(footer.getByRole('link',{name:'HustleHub+ home'})).toHaveAttribute('href','/');expect(footer.getByRole('link',{name:'Explore services'})).toHaveAttribute('href','/gigs');expect(footer.getByRole('link',{name:'Join the community'})).toHaveAttribute('href','/register');expect(screen.queryByText(/Part 2 assessment/)).not.toBeInTheDocument();expect(screen.queryByText(/Skills that move you forward/)).not.toBeInTheDocument();});
test('client footer points to own bookings',()=>{const footer=setup({email:'client@example.test',role:'client'});expect(footer.getByRole('link',{name:'Your bookings'})).toHaveAttribute('href','/bookings');expect(footer.queryByRole('link',{name:'Join the community'})).not.toBeInTheDocument();});
test('freelancer footer points to own dashboard',()=>{const footer=setup({email:'freelancer@example.test',role:'freelancer'});expect(footer.getByRole('link',{name:'Your dashboard'})).toHaveAttribute('href','/dashboard');});
test('admin sees an Admin link and no freelancer or client links',()=>{setup({email:'admin@example.test',role:'admin'});const nav=within(screen.getByRole('navigation',{name:'Main navigation'}));expect(nav.getByRole('link',{name:'Admin'})).toHaveAttribute('href','/admin');expect(nav.queryByRole('link',{name:'Dashboard'})).not.toBeInTheDocument();expect(nav.queryByRole('link',{name:'My bookings'})).not.toBeInTheDocument();});
test('clients and freelancers do not see the Admin link',()=>{setup({email:'client@example.test',role:'client'});expect(screen.queryByRole('link',{name:'Admin'})).not.toBeInTheDocument();});
