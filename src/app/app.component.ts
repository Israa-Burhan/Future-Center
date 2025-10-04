import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './modules/shared/components/spinner/spinner.component';
import { supabase } from './core/services/supabase.client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Future_Center';
  loading = true;

  ngOnInit() {
    this.initSessionAndRole();
  }

  private async initSessionAndRole() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    try {
      const uid = session?.user.id;
      if (uid) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', uid)
          .single();
        if (data?.role) localStorage.setItem('sb_role', data.role);
      }
    } catch (e) {
      console.error('Error caching role on app init:', e);
    }

    this.loading = false;
  }
}
