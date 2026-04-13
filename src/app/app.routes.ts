import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

// Auth Components
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { RegisterWorkshopComponent } from './features/auth/register-workshop.component';
import { ChangePasswordComponent } from './features/auth/change-password.component';

// Dashboard Components
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ReportIncidentComponent } from './features/dashboard/report-incident.component';
import { MyIncidentsComponent } from './features/dashboard/my-incidents.component';
import { MyAppointmentsComponent } from './features/dashboard/my-appointments.component';

// Admin Components
import { AdminPanelComponent } from './features/admin/admin-panel.component';

// Workshop Components
import { WorkshopManagementComponent } from './features/workshop/workshop-management.component';

// Layout Components
import { NavbarComponent } from './shared/components/navbar.component';
import { FooterComponent } from './shared/components/footer.component';

export const routes: Routes = [
  // Auth routes (no layout)
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'register-workshop',
    component: RegisterWorkshopComponent
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard]
  },

  // Protected routes (with layout)
  {
    path: '',
    component: NavbarComponent,
    outlet: 'navbar'
  },
  {
    path: '',
    component: FooterComponent,
    outlet: 'footer'
  },

  // Dashboard
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'report-incident',
    component: ReportIncidentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-incidents',
    component: MyIncidentsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-appointments',
    component: MyAppointmentsComponent,
    canActivate: [AuthGuard]
  },

  // Admin Panel
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },

  // Workshop Management
  {
    path: 'workshop',
    component: WorkshopManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Workshop'] }
  },

  // Redirect to dashboard by default
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Catch-all
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
