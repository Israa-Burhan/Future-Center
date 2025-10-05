import { Injectable } from '@angular/core';
import { supabase } from '../../../core/services/supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    localStorage.setItem('sb_session', JSON.stringify(data.session));
    await this.cacheRole();
    return data.session;
  }
  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('sb_session');
    localStorage.removeItem('sb_role');
  }
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
  async getRole(): Promise<'admin' | 'staff'> {
    const cached = localStorage.getItem('sb_role') as 'admin' | 'staff' | null;
    if (cached) return cached;
    return this.cacheRole();
  }
  private async cacheRole(): Promise<'admin' | 'staff'> {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) throw new Error('No session');
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .single();
    if (error) throw error;
    localStorage.setItem('sb_role', data.role);
    return data.role;
  }
}
