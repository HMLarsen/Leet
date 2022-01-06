import { Component, OnInit } from '@angular/core';
import { GoogleAnalyticsService } from './services/google-analytics.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	constructor(private googleAnalyticsService: GoogleAnalyticsService) {
		this.googleAnalyticsService.setupAnalytics();
	}

	ngOnInit(): void {
	}

}
