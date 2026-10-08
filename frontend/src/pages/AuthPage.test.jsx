import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import AuthPage from './AuthPage';
import {useAuth} from '../auth';
jest.mock('../auth',()=>({useAuth:jest.fn()}));
const authenticate=jest.fn();
beforeEach(()=>{authenticate.mockReset();useAuth.mockReturnValue({authenticate});});
function setup(register=false){render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Routes><Route path="/" element={<AuthPage register={register}/>}/><Route path="/gigs" element={<p>Explore destination</p>}/><Route path="/dashboard" element={<p>Dashboard destination</p>}/></Routes></MemoryRouter>);return userEvent.setup();}
async function fill(user,password='Password1'){await user.type(screen.getByLabelText('Email'),'mel@example.test');await user.type(screen.getByLabelText('Password'),password);}
test('login sends correct credentials and navigates client to gigs',async()=>{authenticate.mockResolvedValue({role:'client'});const user=setup();await fill(user);await user.click(screen.getByRole('button',{name:'Sign in'}));expect(authenticate).toHaveBeenCalledWith('login',{email:'mel@example.test',password:'Password1'});expect(await screen.findByText('Explore destination')).toBeInTheDocument();});
test('shows readable login failure',async()=>{authenticate.mockRejectedValue(new Error('Invalid email or password.'));const user=setup();await fill(user);await user.click(screen.getByRole('button',{name:'Sign in'}));expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');expect(screen.getByRole('button',{name:'Sign in'})).toBeEnabled();});
test('blocks weak registration password before API request',async()=>{const user=setup(true);await fill(user,'weak');await user.click(screen.getByRole('button',{name:'Create account'}));expect(screen.getByRole('alert')).toHaveTextContent('8–128');expect(authenticate).not.toHaveBeenCalled();});
test('registration submits freelancer role and navigates to dashboard',async()=>{authenticate.mockResolvedValue({role:'freelancer'});const user=setup(true);await fill(user);await user.selectOptions(screen.getByLabelText('Account type'),'freelancer');await user.click(screen.getByRole('button',{name:'Create account'}));expect(authenticate).toHaveBeenCalledWith('register',{email:'mel@example.test',password:'Password1',role:'freelancer'});expect(await screen.findByText('Dashboard destination')).toBeInTheDocument();});
test('disables submit while login is pending',async()=>{authenticate.mockReturnValue(new Promise(()=>{}));const user=setup();await fill(user);await user.click(screen.getByRole('button',{name:'Sign in'}));expect(screen.getByRole('button',{name:'Please wait…'})).toBeDisabled();});
