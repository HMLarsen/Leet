import { animate, state, style, transition, trigger } from "@angular/animations";

export const fadeInOut =
	trigger('fadeInOut', [
		transition(':enter', [
			style({ opacity: 0 }),
			animate('0.2s', style({ opacity: 1 }))
		])
	]);

export const inOutAnimation = trigger('inOutAnimation', [
	state('in', style({ opacity: 1 })),
	transition(':enter', [style({ opacity: '0' }), animate('0.5s ease-out', style({ opacity: '1' }))]),
	transition(':leave', [style({ opacity: '1' }), animate('0.5s ease-out', style({ opacity: '0' }))]),
])