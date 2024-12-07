import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BluetoothService } from '../bluetooth.service';
import { Subscription } from 'rxjs';

import { addIcons } from 'ionicons';

import { exit, flash, trash } from 'ionicons/icons';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonLabel,
  IonItem,
  IonList,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.page.html',
  styleUrls: ['./alerts.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonButton,
    IonMenuButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class AlertsPage implements OnInit, OnDestroy {
  characteristicValueSubscription: Subscription = new Subscription();

  constructor(
    public bleService: BluetoothService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ exit, flash, trash });
  }

  toggleAlert() {
    this.bleService.writeToggleAlerts(true);
  }
  clearLogs() {
    this.bleService.clearNotificationLog();
  }

  ngOnInit() {
    this.characteristicValueSubscription =
      this.bleService.characteristicValue$.subscribe((value) => {
        this.cdr.detectChanges(); // Force UI update
      });
  }

  ngOnDestroy() {
    if (this.characteristicValueSubscription) {
      this.characteristicValueSubscription.unsubscribe();
    }
  }

  disconnect() {
    this.bleService.disconnect();
  }
}
