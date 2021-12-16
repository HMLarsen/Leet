import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';

declare var bootstrap: any;

@Directive({
	selector: '[appTooltip]'
})
export class TooltipDirective implements OnInit {

	tooltip: any;
	@Input() tooltipEventShow: EventEmitter<string>;

	@HostListener('mouseleave') onMouseLeave() {
		this.hide();
	}

	@HostListener('click') onClick() {
		this.hide();
	}

	constructor(el: ElementRef) {
		this.tooltip = new bootstrap.Tooltip(el.nativeElement);
	}

	ngOnInit(): void {
		if (this.tooltipEventShow) {
			this.tooltipEventShow.subscribe(() => this.show());
		}
	}

	show() { this.tooltip.show() }

	hide() { this.tooltip.hide() }

}
