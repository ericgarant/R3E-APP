import {
  Component,
  Inject,
  inject,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { BluetoothService } from '../bluetooth.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

//import { IonicModule } from '@ionic/angular'; // Import IonicModule to ensure Ionic services are available

import { addIcons } from 'ionicons';
import { map } from 'ionicons/icons';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonLabel,
  IonButtons,
  IonMenuButton,
  IonRange,
  IonItem,
  IonGrid,IonRow,IonCol
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-map',
  standalone: true, // Standalone component
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonLabel,
    IonButtons,
    IonMenuButton,
    IonRange,
    IonItem,IonGrid,IonRow,IonCol
  ],
})
export class MapPage {
  //mapZoom: number = 16;
  constructor(public bleService: BluetoothService) {
    addIcons({ map });
  }
}
