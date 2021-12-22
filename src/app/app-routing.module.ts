import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

import { AngularFireAuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { SetEventComponent } from './events/set-event/set-event.component';
import { EventComponent } from './events/event/event.component';
import { MyEventsComponent } from './events/my-events.component';
import { EventPublicComponent } from './events/event-public/event-public.component';
import { EventParticipantsComponent } from './events/event-participants/event-participants.component';

const redirectUnauthorized = () => redirectUnauthorizedTo(['']);
const redirectAuthorizedToDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
	{ path: '', component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectAuthorizedToDashboard } },
	{
		path: 'dashboard', component: DashboardComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorized }, children: [
			{ path: '', redirectTo: 'events', pathMatch: 'full' },
			{ path: 'events', component: MyEventsComponent },
			{ path: 'events/create', component: SetEventComponent },
			{ path: 'events/:id', component: EventComponent },
			{ path: 'events/:id/edit', component: SetEventComponent },
			{ path: 'events/:id/participants', component: EventParticipantsComponent }
		]
	},
	{ path: 'events/:params', component: EventPublicComponent },
	{ path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
