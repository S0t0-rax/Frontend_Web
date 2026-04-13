import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="flex items-center justify-center p-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
      </div>
    </div>
  `
})
export class LoaderComponent {}
