import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Home } from './dashboard/home/home';
import { Users } from './dashboard/admin/users/users';
import { Bitacora } from './dashboard/admin/bitacora/bitacora';
import { MonitoringComponent } from './dashboard/admin/monitoring/monitoring';
import { Profile } from './dashboard/profile/profile';
import { WorkshopManagementComponent } from './dashboard/workshop-management/workshop-management.component';
import { GestionPersonalComponent } from './dashboard/workshop-management/gestion-personal.component';
import { authGuard, publicGuard, adminGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [publicGuard] },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard],
    children: [
      { path: '', component: Home },
      { path: 'admin/users', component: Users, canActivate: [adminGuard] },
      { path: 'admin/monitoring', component: MonitoringComponent, canActivate: [adminGuard] },
      { path: 'admin/bitacora', component: Bitacora, canActivate: [adminGuard] },
      { 
        path: 'incidents/available', 
        loadComponent: () => import('./dashboard/incidents/available/available').then(m => m.AvailableIncidentsComponent) 
      },
      { 
        path: 'incidents/management', 
        loadComponent: () => import('./dashboard/incidents/management/management').then(m => m.IncidentManagementComponent) 
      },
      { path: 'workshop-management', component: WorkshopManagementComponent },
      { path: 'workshop-management/personal', component: GestionPersonalComponent },
      { path: 'profile', component: Profile }

    ]
  },
  { path: '**', redirectTo: '/login' },
];
