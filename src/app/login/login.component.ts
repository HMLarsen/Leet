import { Component, EventEmitter, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { UserAccessService } from '../services/user-access.service';

interface Profile {
	email: string;
}

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	showModalEmitter = new EventEmitter<string>();

	constructor(
		private titleService: Title,
		private router: Router,
		private userAccessService: UserAccessService,
		public auth: AngularFireAuth
	) { }

	ngOnInit(): void {
		this.titleService.setTitle('Leet');
	}

	login() {
		this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
			.then(async response => {
				const userInfo = response.additionalUserInfo;
				const email = (<Profile>userInfo?.profile).email;
				const isAllowedUser = await this.userAccessService.isAllowedUser(email);
				if (isAllowedUser) {
					this.router.navigate(['/dashboard']);
				} else {
					response.user?.delete();
					this.showModalEmitter.emit();
				}
			});
	}

}
