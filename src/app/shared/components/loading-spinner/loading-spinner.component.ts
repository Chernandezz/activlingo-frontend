import { Component } from "@angular/core";

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div
      class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"
    ></div>
  `,
})
export class LoadingSpinnerComponent {}
