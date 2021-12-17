import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Event } from 'src/app/model/event.model';
import { Person } from 'src/app/model/person.model';
import { EventService } from 'src/app/services/event.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
	selector: 'app-event-people',
	templateUrl: './event-people.component.html',
	styleUrls: ['./event-people.component.scss']
})
export class EventPeopleComponent implements OnInit {

	eventId: string;
	event: Event;
	people: Person[] = [];
	loadingEvent = true;
	importNamesForm: FormGroup;
	peopleNameCopied = false;
	loadingForm = false;

	constructor(
		private route: ActivatedRoute,
		private eventService: EventService,
		private utilsService: UtilsService,
		private titleService: Title
	) { }

	ngOnInit(): void {
		this.importNamesForm = new FormGroup({
			names: new FormControl('', Validators.required)
		});
		this.getEvent();
	}

	getEvent() {
		this.eventId = this.route.snapshot.paramMap.get('id')!;
		this.eventService.getEvent(this.eventId)
			.then(observable => {
				observable.subscribe({
					next: value => {
						this.event = value.payload.data()!;
						if (this.event) {
							this.titleService.setTitle('Leet - ' + this.event.name);
							this.getPeople();
						}
						this.loadingEvent = false;
					},
					error: error => {
						this.loadingEvent = false;
					}
				});
			});
	}

	sortPeople(people: Person[]) {
		people.sort((a, b) => {
			if (a.name > b.name) return 1;
			if (b.name > a.name) return -1;
			return 0;
		});
	}

	getPeople() {
		this.eventService.getPeople(this.eventId)
			.then(observable => {
				observable.subscribe({
					next: value => {
						this.people = [];
						value.forEach(data => {
							const person = data.payload.doc.data();
							person.name = this.utilsService.capitalize(person.name);
							this.people.push(person);
						});
						this.sortPeople(this.people);
					}
				});
			});
	}

	async onSubmitImportNamesForm() {
		try {
			this.loadingForm = true;
			const names = this.importNamesForm.get('names')?.value?.split('\n');
			const fillDate = Timestamp.now();
			const people: Person[] = [];
			names.map((name: string) => {
				name = name.trim();
				if (!!name) {
					const person: Person = { name, fillDate };
					people.push(person)
				}
			});
			await this.eventService.addPeople(this.eventId, people);
			this.loadingForm = false;
			this.importNamesForm.reset();
		} catch (e) {
			alert('Ocorreu um erro: ' + e);
			this.loadingForm = false;
		}
	}

	copyList() {
		const peopleNames = this.people.map(person => person.name);
		this.utilsService.copyTextToClipboard(peopleNames.join('\n'));
		this.peopleNameCopied = true;
		setTimeout(() => this.peopleNameCopied = false, 2000);
	}

	personListTrackBy(index: number, item: Person) {
		return item.name;
	}

}
