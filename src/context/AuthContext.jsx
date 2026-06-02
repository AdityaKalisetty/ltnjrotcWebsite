import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);
const UNAUTHORIZED_MESSAGE =
  'This account is not authorized for the cadet portal. Please contact unit staff.';
const PROFILE_COLUMNS = 'id, auth_user_id, name, email, rank, platoon, role, awards';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState(null);

  const fetchProfileByAuthUserId = async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from('cadet_profiles')
      .select(PROFILE_COLUMNS)
      .eq('auth_user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    setProfile(data);
    return data;
  };

  const claimProfileForUser = async (email) => {
    if (!email) {
      return null;
    }

    const { data, error } = await supabase.rpc('claim_my_cadet_profile', {
      roster_email: email,
    });

    if (error || !data) {
      return null;
    }

    const nextProfile = Array.isArray(data) ? data[0] : data;

    if (!nextProfile) {
      return null;
    }

    setProfile(nextProfile);
    return nextProfile;
  };

  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const validateAuthorizedUser = async (nextSession) => {
    if (!nextSession?.user?.id) {
      setProfile(null);
      return true;
    }

    const prof = await fetchProfileByAuthUserId(nextSession.user.id);

    if (prof) {
      return true;
    }

    const linkedProfile = await claimProfileForUser(nextSession.user.email || '');

    if (linkedProfile) {
      return true;
    }

    await supabase.auth.signOut();
    clearAuthState();
    return false;
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      await validateAuthorizedUser(currentSession);

      setLoading(false);
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      setAuthEvent(event);
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user?.id) {
        setProfile(null);
        return;
      }

      // Recovery and password update flows already have a valid temporary session.
      // Avoid blocking those transitions with extra profile checks in the event callback.
      if (event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') {
        return;
      }

      void validateAuthorizedUser(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.session) {
      return { data, error };
    }

    const isAuthorized = await validateAuthorizedUser(data.session);

    if (!isAuthorized) {
      return {
        data: null,
        error: new Error(UNAUTHORIZED_MESSAGE),
      };
    }

    return { data, error };
  };

  const requestPasswordSetup = async (email) => {
    const redirectTo = `${window.location.origin}${window.location.pathname}?auth_flow=recovery`;

    return supabase.auth.resetPasswordForEmail(email, { redirectTo });
  };

  const updatePassword = async (password) => {
    return supabase.auth.updateUser({ password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAuthState();
    // redirect to login after sign out
    try {
      window.location.hash = '#/login';
    } catch (e) {
      // ignore in non-browser environments
    }
  };

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      authEvent,
      signInWithEmail,
      requestPasswordSetup,
      updatePassword,
      signOut,
    }),
    [session, user, profile, loading, authEvent]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
