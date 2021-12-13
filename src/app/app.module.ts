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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AngularFireModule } from '@angular/fire/compat';
import { DashboardComponent } from './dashboard/dashboard.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { CreateEventComponent } from './create-event/create-event.component';

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		DashboardComponent,
		CreateEventComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		ReactiveFormsModule,
		AngularFireModule.initializeApp(firebaseConfig),
		provideFirebaseApp(() => initializeApp(firebaseConfig)),
		provideFirestore(() => getFirestore()),
		provideAuth(() => getAuth())
	],
	providers: [
		{ provide: LOCALE_ID, useValue: 'pt-BR' }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
