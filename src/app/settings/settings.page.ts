import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';  // Import IonicModule

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { BluetoothService } from '../bluetooth.service';
import { R3ENetwork, Node } from '../network.model';
import { AddNodeModalPage } from './add-node-modal/add-node-modal.page';
import { EditNodeModalPage } from './edit-node-modal/edit-node-modal.page';
import { ModalController, AlertController } from '@ionic/angular/standalone';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonItem,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonLabel,
    FormsModule,
  ],
})
export class SettingsPage {
  constructor(
    public bleService: BluetoothService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  async openAddNodeModal() {
    const modal = await this.modalController.create({
      component: AddNodeModalPage,
      componentProps: {
        network: this.network,
      },
    });
    await modal.present();
  }

  async openEditNodeModal(node: Node) {
    const modal = await this.modalController.create({
      component: EditNodeModalPage,
      componentProps: {
        node: node,
        network: this.network,
      },
    });
    await modal.present();
  }

  deleteNode(index: number) {
    this.network.nodeList.splice(index, 1);
    this.network.nodeCount = this.network.nodeList.length;
  }

  sendSettings() {
    this.bleService.sendNetworkData();
  }

  network = this.bleService.getNetwork();
}
