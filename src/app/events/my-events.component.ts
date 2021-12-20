import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'app-my-events',
	templateUrl: './my-events.component.html',
	styleUrls: ['./my-events.component.scss']
})
export class MyEventsComponent implements OnInit {

	constructor(private titleService: Title) { }

	ngOnInit(): void {
		this.titleService.setTitle('Leet - Meus eventos');
	}

}
