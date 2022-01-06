import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// firebase
import { firebaseConfig } from '../environments/firebase.config';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditorDirective } from './directives/editor.directive';
import { EventParticipantsComponent } from './events/event-participants/event-participants.component';
import { EventPublicComponent } from './events/event-public/event-public.component';
import { EventComponent } from './events/event/event.component';
import { MyEventsComponent } from './events/my-events.component';
import { SetEventComponent } from './events/set-event/set-event.component';
import { LoginComponent } from './login/login.component';
import { ModalComponent } from './modal/modal.component';

registerLocaleData(localePt);



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
		EventParticipantsComponent,
		ModalComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		ReactiveFormsModule,
		FormsModule,
		AngularFireModule.initializeApp(firebaseConfig),
		provideFirebaseApp(() => initializeApp(firebaseConfig)),
		provideFirestore(() => getFirestore()),
		provideAuth(() => getAuth()),
		AngularFireStorageModule
	],
	providers: [
		{ provide: LOCALE_ID, useValue: 'pt-BR' }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
