import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PropertyListComponent } from './components/property-list/property-list.component';
import { PropertyDetailComponent } from './components/property-detail/property-detail.component';
import { PropertyOverviewComponent } from './components/property-overview/property-overview.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AddPropertyComponent } from './components/add-property/add-property.component';
import { MyPropertiesComponent } from './components/my-properties/my-properties.component';
import { MyFavoritesComponent } from './components/my-favorites/my-favorites.component';
import { AuthGuard } from './guards/auth.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { EditPropertyComponent } from './components/edit-property/edit-property.component';
import { MessagesComponent } from './components/messages/messages.component';
import { MeetingsPageComponent } from './pages/meetings-page/meetings-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'properties', component: PropertyListComponent },
  { path: 'properties/:id', component: PropertyDetailComponent },
  { path: 'property-overview/:id', component: PropertyOverviewComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'add-property', component: AddPropertyComponent, canActivate: [AuthGuard] },
  { path: 'my-properties', component: MyPropertiesComponent, canActivate: [AuthGuard] },
  { path: 'my-favorites', component: MyFavoritesComponent, canActivate: [AuthGuard] },
  { path: 'edit-property/:id', component: EditPropertyComponent, canActivate: [AuthGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: 'meetings', component: MeetingsPageComponent, canActivate: [AuthGuard] },
  // Add a catch-all route for 404 pages
  { path: '**', component: NotFoundComponent }
];
