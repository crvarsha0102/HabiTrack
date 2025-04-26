import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'properties',
    loadComponent: () => import('./components/property-list/property-list.component').then(c => c.PropertyListComponent)
  },
  {
    path: 'properties/:id',
    loadComponent: () => import('./components/property-detail/property-detail.component').then(c => c.PropertyDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(c => c.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(c => c.ResetPasswordComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-properties',
    loadComponent: () => import('./components/my-properties/my-properties.component').then(c => c.MyPropertiesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-property',
    loadComponent: () => import('./components/add-property/add-property.component').then(c => c.AddPropertyComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-property/:id',
    loadComponent: () => import('./components/edit-property/edit-property.component').then(c => c.EditPropertyComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./components/messages/messages.component').then(c => c.MessagesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'meetings',
    loadComponent: () => import('./pages/meetings-page/meetings-page.component').then(c => c.MeetingsPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 