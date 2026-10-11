import {request} from './api';
jest.mock('./config',()=>({API_URL:'https://localhost:5000/api'}));
beforeEach(()=>{global.fetch=jest.fn();});
const reply=(status,data)=>({ok:status>=200&&status<300,status,json:async()=>data});
test('attaches bearer token and serializes booking body',async()=>{fetch.mockResolvedValue(reply(201,{success:true,data:{booking:{_id:'b'},transaction:{_id:'t'}}}));const result=await request('/bookings',{method:'POST',token:'test-token',body:{gigId:'gig'}});expect(fetch).toHaveBeenCalledWith('https://localhost:5000/api/bookings',expect.objectContaining({method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer test-token'},body:'{"gigId":"gig"}'}));expect(result.transaction._id).toBe('t');});
test('public gig requests do not attach a token',async()=>{fetch.mockResolvedValue(reply(200,{success:true,data:{gigs:[]}}));await request('/gigs');expect(fetch.mock.calls[0][1].headers).toEqual({});});
test.each([400,401,403,404,429,500])('handles status %s without leaking server details',async status=>{fetch.mockResolvedValue(reply(status,{message:'SECRET stacktrace database password'}));await expect(request('/gigs')).rejects.toMatchObject({status});await expect(request('/gigs')).rejects.not.toThrow('SECRET');});
test('network failure gives actionable message',async()=>{fetch.mockRejectedValue(new TypeError('Failed to fetch'));await expect(request('/gigs')).rejects.toThrow('Cannot reach the API');});
test('invalid successful response is rejected',async()=>{fetch.mockResolvedValue(reply(200,null));await expect(request('/gigs')).rejects.toThrow('unexpected response');});

test('login 401 reports invalid credentials rather than expired session',async()=>{fetch.mockResolvedValue(reply(401,{message:'private server details'}));await expect(request('/auth/login',{method:'POST',body:{email:'person@example.test',password:'not-a-real-secret'}})).rejects.toThrow('Invalid email or password.');});
test('protected-route 401 retains expired-session guidance',async()=>{fetch.mockResolvedValue(reply(401,{}));await expect(request('/income',{token:'test-token'})).rejects.toThrow('session is invalid or expired');});
