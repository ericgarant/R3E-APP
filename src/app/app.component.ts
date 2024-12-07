import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import { eye, location, settings, exit, map } from 'ionicons/icons';
import { BluetoothService } from './bluetooth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonLabel,
    IonIcon,
    IonItem,
    IonList,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonMenuToggle,
    RouterOutlet,
    RouterLinkActive,
    RouterLink
  ],
})
export class AppComponent {
  constructor(public bleService: BluetoothService) {
    addIcons({ eye, location, settings, exit, map });
  }
  onDisconnect() {
    this.bleService.disconnect();
  }
}
