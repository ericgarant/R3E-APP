// edit-node-modal.page.ts
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { R3ENetwork, Node } from '../../network.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';

import { IonicModule } from '@ionic/angular'; // Import IonicModule

//import { IonButton, IonItem, IonLabel, IonInput, IonRow, IonCol } from '@ionic/angular';
import {
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonSelectOption,
  IonNote,
  IonCheckbox,
  IonRadio,
  IonRadioGroup
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-edit-node-modal',
  standalone: true,
  templateUrl: './edit-node-modal.page.html',
  styleUrls: ['./edit-node-modal.page.scss'],
  imports: [
    ReactiveFormsModule,  // Import ReactiveFormsModule for reactive forms
    CommonModule,
    FormsModule,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonRow,
    IonCol,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonSelectOption,
    IonNote, 
    IonCheckbox,
    IonRadio,
  IonRadioGroup
  ],
})
export class EditNodeModalPage implements OnInit {
  @Input() node!: Node;  // Receive the node from the parent component
  @Input() network!: R3ENetwork;  // Receive the network from the parent

  currentNodeForm!: FormGroup;  // FormGroup for Reactive Form
  currentMACs: string[] = [];  // List of available MAC addresses as strings for selection

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder  // Inject the FormBuilder
  ) {}

  ngOnInit() {
    // Initialize the form with validation
    this.currentNodeForm = this.fb.group({
      nodeID: [this.node.nodeID, [Validators.required, Validators.min(0)]],
      currentMAC: [this.node.currentMAC.join(','), Validators.required],
      previousMAC: [this.node.previousMAC.join(','), Validators.required],
      nextMACs: [this.node.nextMACs.join(','), Validators.required],
      isHub: [this.node.isHub],
      hasCam: [this.node.hasCam],
    });

    // Collect all available MAC addresses from the node list
    this.currentMACs = this.network.nodeList
      .map(node => node.currentMAC.join(','))
      .filter(mac => mac.length > 0);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  editNode() {
    if (this.currentNodeForm.valid) {
      const formValues = this.currentNodeForm.value;
  
      // Convert form values into the correct types (numbers for MAC addresses)
      this.node.nodeID = formValues.nodeID;
  
      // Convert currentMAC, previousMAC, and nextMACs to arrays of numbers
      this.node.currentMAC = formValues.currentMAC.split(',').map((mac: string) => Number(mac.trim()));
      this.node.previousMAC = formValues.previousMAC.split(',').map((mac: string) => Number(mac.trim()));
      //this.node.nextMACs = formValues.nextMACs.split(',').map((mac: string) => Number(mac.trim()));
      this.node.nextMACs = formValues.nextMACs;


  
      // Assign boolean values for isHub and hasCam
      this.node.isHub = formValues.isHub;
      this.node.hasCam = formValues.hasCam;
  
      // Update the node list in the network
      const index = this.network.nodeList.findIndex(
        (node) => node.nodeID === this.node.nodeID
      );
      if (index !== -1) {
        this.network.nodeList[index] = { ...this.node };
      }
  
      this.dismiss();  // Close the modal
    } else {
      console.log("Form is not valid");
    }
  }
  
  
}