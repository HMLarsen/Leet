import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class UtilsService {

	constructor() { }

	toLocaleISOString(date: Date) {
		function pad(number: number) {
			if (number < 10) {
				return '0' + number;
			}
			return number;
		}
		return date.getFullYear() +
			'-' + pad(date.getMonth() + 1) +
			'-' + pad(date.getDate()) +
			'T' + pad(date.getHours()) +
			':' + pad(date.getMinutes()) +
			':' + pad(date.getSeconds()) +
			'.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
			'Z';
	}

}
