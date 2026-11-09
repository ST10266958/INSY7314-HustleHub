import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import {request} from '../api';
jest.mock('../api',()=>({request:jest.fn()}));
const TOKEN='a'.repeat(64);
beforeEach(()=>{request.mockReset();window.history.replaceState(null,'','/');});

test('forgot password shows the same confirmation after submitting a valid email',async()=>{
  request.mockResolvedValue({});
  render(<MemoryRouter><ForgotPassword/></MemoryRouter>);
  await userEvent.type(screen.getByLabelText(/email/i),'a@example.com');
  await userEvent.click(screen.getByRole('button',{name:/send reset link/i}));
  expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
  expect(request).toHaveBeenCalledWith('/auth/forgot-password',{method:'POST',body:{email:'a@example.com'}});
});

test('forgot password rejects an invalid email without calling the API',async()=>{
  render(<MemoryRouter><ForgotPassword/></MemoryRouter>);
  await userEvent.type(screen.getByLabelText(/email/i),'nope');
  await userEvent.click(screen.getByRole('button',{name:/send reset link/i}));
  expect(request).not.toHaveBeenCalled();
});

test('reset page without a token asks for a new link',()=>{
  render(<MemoryRouter><ResetPassword/></MemoryRouter>);
  expect(screen.getByText(/reset link missing/i)).toBeInTheDocument();
});

test('reset page blocks mismatched passwords and submits matching ones with the token',async()=>{
  window.history.replaceState(null,'',`/reset-password#token=${TOKEN}`);
  request.mockResolvedValue({});
  render(<MemoryRouter><ResetPassword/></MemoryRouter>);
  await userEvent.type(screen.getByLabelText(/^new password/i),'N3wStrongPass');
  await userEvent.type(screen.getByLabelText(/confirm/i),'Different1Pass');
  await userEvent.click(screen.getByRole('button',{name:/update password/i}));
  expect(request).not.toHaveBeenCalled();
  await userEvent.clear(screen.getByLabelText(/confirm/i));
  await userEvent.type(screen.getByLabelText(/confirm/i),'N3wStrongPass');
  await userEvent.click(screen.getByRole('button',{name:/update password/i}));
  await waitFor(()=>expect(request).toHaveBeenCalledWith('/auth/reset-password',{method:'POST',body:{token:TOKEN,password:'N3wStrongPass'}}));
  expect(await screen.findByText(/password updated/i)).toBeInTheDocument();
  expect(window.location.hash).toBe('');
});
