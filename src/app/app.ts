import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './shared/navbar/navbar.component';
import { CustomDialogComponent } from './core/components/custom-dialog/custom-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CustomDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
