import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// locale pt-BR
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt);

// firebase
import { firebaseConfig } from '../environments/firebase.config';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AngularFireModule } from '@angular/fire/compat';
import { DashboardComponent } from './dashboard/dashboard.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { SetEventComponent } from './events/set-event/set-event.component';
import { EventComponent } from './events/event/event.component';
import { MyEventsComponent } from './events/my-events.component';
import { EventPublicComponent } from './events/event-public/event-public.component';
import { EditorDirective } from './directives/editor.directive';
import { EventPeopleComponent } from './events/event-people/event-people.component';
import { ModalComponent } from './modal/modal.component';
import { EventsPaginationComponent } from './events-pagination/events-pagination.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		DashboardComponent,
		SetEventComponent,
		EventComponent,
		MyEventsComponent,
		EventPublicComponent,
		EditorDirective,
		EventPeopleComponent,
		ModalComponent,
		EventsPaginationComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		ReactiveFormsModule,
		AngularFireModule.initializeApp(firebaseConfig),
		provideFirebaseApp(() => initializeApp(firebaseConfig)),
		provideFirestore(() => getFirestore()),
		provideAuth(() => getAuth()),
		AngularFireStorageModule,
		InfiniteScrollModule
	],
	providers: [
		{ provide: LOCALE_ID, useValue: 'pt-BR' }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
