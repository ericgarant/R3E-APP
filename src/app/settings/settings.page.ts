import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonIcon , IonGrid,IonRow,IonCol,IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { BluetoothService } from '../bluetooth.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonIcon, IonBackButton, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonGrid,IonRow,IonCol,IonList,IonLabel, FormsModule]
})
export class SettingsPage  {

  constructor(public bleService: BluetoothService) { }

  
  sendSettings() {
    this.bleService.sendNetworkData();
  }

  network = this.bleService.getNetwork();
}
