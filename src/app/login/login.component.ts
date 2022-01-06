import { Component, EventEmitter, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { SEOService } from '../seo.service';
import { UserService } from '../services/user-access.service';

interface Profile {
	email: string;
}

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	loadingLogin = false;
	showModalEmitter = new EventEmitter<string>();

	constructor(
		private seoService: SEOService,
		private router: Router,
		private userService: UserService,
		public auth: AngularFireAuth
	) { }

	ngOnInit(): void {
		this.seoService.updateTitle('Leet', false);
	}

	login() {
		this.loadingLogin = true;
		this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
			.then(async response => {
				try {
					const userInfo = response.additionalUserInfo;
					const email = (<Profile>userInfo?.profile).email;
					const isAllowedUser = await this.userService.isAllowedUser(email);
					if (isAllowedUser) {
						this.router.navigate(['/dashboard']);
					} else {
						throw new Error;
					}
				} catch {
					response.user?.delete();
					this.showModalEmitter.emit();
				}
			})
			.catch(() => { })
			.finally(() => this.loadingLogin = false);
	}

}
