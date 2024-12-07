import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonLabel,
  IonBackButton,
  IonButton,
  IonItem,
  IonList,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { BluetoothService } from '../bluetooth.service';
import { App } from '@capacitor/app';

import { addIcons } from 'ionicons';

import { exit, telescope,bluetooth } from 'ionicons/icons';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonSpinner,
    IonBackButton,
    IonLabel,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonItem,
    IonList,
  ],
})
export class ScanPage {
  constructor(public bleService: BluetoothService) {
    addIcons({ exit, telescope , bluetooth});
  }

  quitApp() {
    App.exitApp(); // Use Capacitor App plugin to exit the app
  }

  scan() {
    this.bleService.scanDevices();
  }
}
