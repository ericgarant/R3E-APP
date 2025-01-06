// add-node-modal.page.ts
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { BluetoothService } from '../../bluetooth.service';
import { R3ENetwork, Node } from '../../network.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';  // Import IonicModule

import {
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonRow,
  IonCol,
  IonHeader,IonToolbar,IonTitle,IonButtons, IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-node-modal',
  standalone: true,
  templateUrl: './add-node-modal.page.html',
  styleUrls: ['./add-node-modal.page.scss'],
  imports: [CommonModule, FormsModule, IonButton, IonItem, IonLabel, IonInput, IonRow, IonCol,IonHeader,IonToolbar,IonTitle,IonButtons, IonContent],
})
export class AddNodeModalPage {
  newNode: Node = {
    nodeID: 0,
    isHub: false,
    hasCam: false,
    currentMAC: [],
    previousMAC: [],
    nextMACsCount: 0,
    nextMACs: [],
  };
  network: R3ENetwork;

  constructor(
    private modalController: ModalController,
    private bleService: BluetoothService
  ) {
    this.network = this.bleService.getNetwork();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  addNode() {
    if (this.validateNode(this.newNode)) {
      this.network.nodeList.push(this.newNode);
      this.network.nodeCount = this.network.nodeList.length;
      this.dismiss();
    }
  }

  validateNode(node: Node): boolean {
    // Add validation logic for new node
    return true;
  }
}
