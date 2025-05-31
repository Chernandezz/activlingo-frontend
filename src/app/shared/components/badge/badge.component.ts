import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span
      [class]="
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' +
        class
      "
    >
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  @Input() class = 'bg-gray-100 text-gray-800';
}
