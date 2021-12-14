import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

import { AngularFireAuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { SetEventComponent } from './events/set-event/set-event.component';
import { EventComponent } from './events/event/event.component';
import { EventsComponent } from './events/events.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectAuthorizedToDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
	{ path: 'login', component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectAuthorizedToDashboard } },
	{
		path: 'dashboard', component: DashboardComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }, children: [
			{ path: '', redirectTo: 'events', pathMatch: 'full' },
			{ path: 'events', component: EventsComponent },
			{ path: 'events/create', component: SetEventComponent },
			{ path: 'events/:id', component: EventComponent },
			{ path: 'events/:id/edit', component: SetEventComponent }
		]
	},
	{ path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
