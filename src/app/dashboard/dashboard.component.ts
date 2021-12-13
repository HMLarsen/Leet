import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

	constructor(
		private router: Router,
		public auth: AngularFireAuth
	) { }

	ngOnInit(): void {
	}

	logout() {
		this.auth.signOut()
			.then(() => this.router.navigate(['login']));
	}

}
