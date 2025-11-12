import { Routes } from '@angular/router';
import { MembersComponent } from './components/members/members.component';

export const routes: Routes = [
  {
    path: '',
    component: MembersComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
