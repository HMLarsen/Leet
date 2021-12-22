import { animate, style, transition, trigger } from "@angular/animations";

export const fadeInOut =
	trigger('fadeInOut', [
		transition(':enter', [
			style({ opacity: 0 }),
			animate('0.2s', style({ opacity: 1 }))
		])
	]);