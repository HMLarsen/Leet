import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { Event } from 'src/app/model/event.model';
import { Person } from 'src/app/model/person.model';
import { EventService } from 'src/app/services/event.service';
import { UtilsService } from 'src/app/services/utils.service';
import { firstValueFrom } from 'rxjs';
import { ErrorService } from 'src/app/services/error.service';
import { fadeInOut, inOutAnimation } from 'src/app/animations';

@Component({
	selector: 'app-event-people',
	templateUrl: './event-people.component.html',
	styleUrls: ['./event-people.component.scss'],
	animations: [fadeInOut, inOutAnimation]
})
export class EventPeopleComponent implements OnInit, OnDestroy {

	eventId: string;
	event: Event;
	eventSubscription: Subscription;
	people: Observable<Person[]>;
	loadingEvent = true;
	importNamesForm: FormGroup;
	peopleNameCopied = false;
	loadingForm = false;
	submitFormErrorMessage: string;
	showModalEmitter = new EventEmitter<string>();

	constructor(
		private route: ActivatedRoute,
		private eventService: EventService,
		private utilsService: UtilsService,
		private titleService: Title,
		private errorService: ErrorService
	) { }

	ngOnInit(): void {
		this.eventId = this.route.snapshot.paramMap.get('id')!;
		this.importNamesForm = new FormGroup({
			names: new FormControl('', Validators.required)
		});
		this.getEvent();
	}

	ngOnDestroy(): void {
		if (this.eventSubscription) this.eventSubscription.unsubscribe();
	}

	async getEvent() {
		const observable = await this.eventService.getEvent(this.eventId)
		this.eventSubscription = observable.subscribe({
			next: value => {
				this.event = value.payload.data()!;
				if (this.event) {
					this.titleService.setTitle('Leet - ' + this.event.name);
					this.getPeople();
				}
				this.loadingEvent = false;
			},
			error: () => this.loadingEvent = false
		});
	}

	async getPeople() {
		const observable = await this.eventService.getPeople(this.eventId)
		this.people = observable.pipe(
			map(people => {
				// capitalize and sort
				people.map(person => person.name = this.utilsService.capitalize(person.name));
				return people.sort((a, b) => (a.name > b.name) ? 1 : -1);
			})
		);
	}

	async onSubmitImportNamesForm() {
		this.loadingForm = true;
		try {
			const names = this.importNamesForm.get('names')?.value.split('\n');
			const fillDate = Timestamp.now();
			const people: Person[] = [];
			names.forEach((name: string) => {
				name = name.trim();
				if (!!name) {
					people.push({ name, fillDate })
				}
			});
			await this.eventService.addPeople(this.eventId, people);
		} catch (e) {
			this.submitFormErrorMessage = this.errorService.translateError(e);
			this.showModalEmitter.emit();
		} finally {
			this.importNamesForm.reset();
			this.loadingForm = false;
		}
	}

	async copyList() {
		const peopleName = (await firstValueFrom(this.people)).map(person => person.name);
		this.utilsService.copyTextToClipboard(peopleName.join('\n'));
		this.peopleNameCopied = true;
		setTimeout(() => this.peopleNameCopied = false, 2000);
	}

	personListTrackBy(index: number, item: Person) {
		return item.id;
	}

}
