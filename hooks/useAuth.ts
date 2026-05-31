
import { useState, useEffect } from 'react';
import { Role, User } from '../types';
import { supabase } from '../supabase';
import { USERS } from '../constants';

const env = (import.meta as any).env ?? {};
const useLocalAuth = env.VITE_USE_LOCAL_AUTH === 'true';

// Simple auth hook - just login/logout with Supabase
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionLoginTime, setSessionLoginTime] = useState<Date | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                if (useLocalAuth) {
                    const storedUserJson = localStorage.getItem('local_auth_user');
                    const storedLoginTime = localStorage.getItem('local_auth_login_time');

                    if (storedUserJson) {
                        const storedUser = JSON.parse(storedUserJson) as User;
                        const loginTime = storedLoginTime ? new Date(storedLoginTime) : new Date();

                        if (!storedLoginTime) {
                            localStorage.setItem('local_auth_login_time', loginTime.toISOString());
                        }

                        setUser(storedUser);
                        setSessionLoginTime(loginTime);
                    }

                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // Fetch profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        // Check for stored session login time
                        const storedLoginTime = localStorage.getItem('session_login_time');
                        const loginTime = storedLoginTime ? new Date(storedLoginTime) : new Date();

                        if (!storedLoginTime) {
                            localStorage.setItem('session_login_time', loginTime.toISOString());
                        }

                        setSessionLoginTime(loginTime);
                        setUser({
                            id: profile.id,
                            name: profile.full_name || session.user.email || 'User',
                            email: profile.email || session.user.email,
                            username: profile.email || session.user.email,
                            role: profile.role as Role || Role.Staff,
                            notifications_enabled: profile.notifications_enabled ?? true,
                            email_verified: true,
                            session_login_time: loginTime.toISOString(),
                        });
                    }
                }
            } catch (error) {
                console.error('Session check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setSessionLoginTime(null);
                localStorage.removeItem('session_login_time');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            if (useLocalAuth) {
                const localUser = USERS.find((u) => u.email === email && u.password === password);

                if (!localUser) {
                    return { success: false, error: 'Invalid email or password' };
                }

                const loginTime = new Date();
                localStorage.setItem('local_auth_user', JSON.stringify(localUser));
                localStorage.setItem('local_auth_login_time', loginTime.toISOString());
                setSessionLoginTime(loginTime);
                setUser(localUser);
                return { success: true };
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                // Record login time
                const loginTime = new Date();
                localStorage.setItem('session_login_time', loginTime.toISOString());
                setSessionLoginTime(loginTime);

                // Update last_login in profile
                await supabase
                    .from('profiles')
                    .update({ last_login: loginTime.toISOString() })
                    .eq('id', data.user.id);

                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profile) {
                    setUser({
                        id: profile.id,
                        name: profile.full_name || email,
                        email: profile.email || email,
                        username: profile.email || email,
                        role: profile.role as Role || Role.Staff,
                        notifications_enabled: profile.notifications_enabled ?? true,
                        email_verified: true,
                        session_login_time: loginTime.toISOString(),
                    });
                    return { success: true };
                } else {
                    // No profile - create one
                    const { error: insertError } = await supabase.from('profiles').insert({
                        id: data.user.id,
                        email: email,
                        full_name: email.split('@')[0],
                        role: Role.Staff,
                        last_login: loginTime.toISOString(),
                    });

                    if (!insertError) {
                        setUser({
                            id: data.user.id,
                            name: email.split('@')[0],
                            email: email,
                            username: email,
                            role: Role.Staff,
                            notifications_enabled: true,
                            email_verified: true,
                            session_login_time: loginTime.toISOString(),
                        });
                        return { success: true };
                    }
                }
            }

            return { success: false, error: 'Login failed' };
        } catch (error: any) {
            return { success: false, error: error.message || 'An error occurred' };
        }
    };

    const logout = async () => {
        // Store logout time before clearing
        const logoutTime = new Date();
        console.log(`User ${user?.name} logged out at ${logoutTime.toLocaleString()}`);

        if (useLocalAuth) {
            localStorage.removeItem('local_auth_user');
            localStorage.removeItem('local_auth_login_time');
        } else {
            await supabase.auth.signOut();
            localStorage.removeItem('session_login_time');
        }

        setUser(null);
        setSessionLoginTime(null);
    };

    return {
        user,
        loading,
        login,
        logout,
        sessionLoginTime,
    };
};
