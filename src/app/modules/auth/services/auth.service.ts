import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { supabase } from '../../../core/services/supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);

  private lsGet(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(key);
  }

  private lsSet(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(key, value);
  }

  private lsRemove(...keys: string[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    this.lsSet('sb_session', JSON.stringify(data.session));
    await this.cacheRole();
    return data.session;
  }

  async logout() {
    await supabase.auth.signOut();
    this.lsRemove('sb_session', 'sb_role');
  }

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  async getRole(): Promise<'admin' | 'staff'> {
    const cached = this.lsGet('sb_role') as 'admin' | 'staff' | null;
    if (cached) {
      return cached;
    }
    return this.cacheRole();
  }

  private async cacheRole(): Promise<'admin' | 'staff'> {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      throw new Error('No session');
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .single();
    if (error) {
      throw error;
    }
    this.lsSet('sb_role', data.role);
    return data.role;
  }
}
