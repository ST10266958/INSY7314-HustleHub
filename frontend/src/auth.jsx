import {createContext,useContext,useState,useCallback} from 'react';
import {request} from './api';
const AuthContext=createContext(null);
export function AuthProvider({children}) {
  // Memory only: no JWT/password persistence in localStorage. Refresh requires login.
  const [session,setSession]=useState(null);
  const logout=useCallback(()=>setSession(null),[]);
  const authenticate=async(mode,values)=>{
    const data=await request(`/auth/${mode}`,{method:'POST',body:values});
    if(!data?.token || !data.user) throw new Error('Sign-in response is incomplete. Please try again.');
    setSession({token:data.token,user:data.user});
    return data.user;
  };
  const api=useCallback(async(path,options={})=>{
    try {return await request(path,{...options,token:session?.token});}
    catch(error){if(error.status===401 && session) logout(); throw error;}
  },[session,logout]);
  return <AuthContext.Provider value={{user:session?.user,authenticate,logout,api}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
