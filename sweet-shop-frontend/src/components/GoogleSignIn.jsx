import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function GoogleSignIn({ className = '', onSuccess }){
  const buttonRef = useRef();
  const { loginWithGoogle } = useContext(AuthContext);

  useEffect(()=>{
    const init = () => {
      if (!window.google || !window.google.accounts) return;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) return console.warn('VITE_GOOGLE_CLIENT_ID is not set');
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (res) => {
          const idToken = res?.credential;
          if (!idToken) return;
          try{
            await loginWithGoogle(idToken);
            if (onSuccess) onSuccess();
          }catch(err){
            console.error('Google sign-in failed', err);
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large' });
    }
    if (!window.google || !window.google.accounts){
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.body.appendChild(s);
      return ()=>{ document.body.removeChild(s); }
    }
    init();
  }, [loginWithGoogle, onSuccess]);

  return (
    <div className={className} ref={buttonRef} />
  );
}
