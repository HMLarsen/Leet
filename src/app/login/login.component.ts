import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

declare var UIkit: any;

interface Profile {
	email: string;
}

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	constructor(
		private titleService: Title,
		private router: Router,
		private afs: AngularFirestore,
		public auth: AngularFireAuth
	) { }

	ngOnInit(): void {
		this.titleService.setTitle('Leet - Login');
	}

	login() {
		this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
			.then(response => {
				const userInfo = response.additionalUserInfo;
				const email = (<Profile>userInfo?.profile).email;
				const emailRef = this.afs.collection('auth').doc(email);
				emailRef.get().subscribe(doc => {
					if (doc.exists) {
						this.router.navigate(['/dashboard']);
					} else {
						this.auth.signOut();
						UIkit.modal('#modal-sections').show();
					}
				});
			});
	}

}
