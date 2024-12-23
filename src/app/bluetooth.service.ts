import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { LocalNotifications } from '@capacitor/local-notifications';
import { BehaviorSubject, Subject } from 'rxjs';
import { RangeCustomEvent } from '@ionic/angular';
//import { Filesystem, Directory } from '@capacitor/filesystem';
import { environment } from 'src/environments/environment'; // Import environment variables

let notificationIdCounter = 1;

@Injectable({
  providedIn: 'root',
})
export class BluetoothService {
  private dn: number = 3;
  public mapZoom: number = 16;
  private notificationSubject = new Subject<void>(); // Subject to notify of new notifications
  notification$ = this.notificationSubject.asObservable(); // Observable to subscribe to
  private imageUrl: string = '';

  errLog: boolean = false;
  isScanning: boolean = false;
  devices: any[] = [];
  connectedDevice: any = null;

  private _isConnectedSubject = new BehaviorSubject<boolean>(false);
  isConnected$ = this._isConnectedSubject.asObservable(); // Observable to observe the connection status

  private characteristicValueSubject = new BehaviorSubject<string>('');
  characteristicValue$ = this.characteristicValueSubject.asObservable();

  private _deviceNumberSubject = new BehaviorSubject<number>(this.dn);
  deviceNumber$ = this._deviceNumberSubject.asObservable(); // Observable to observe the connection status

  private notificationLog: Array<{
    value: number;
    timestamp: Date;
    log: string;
  }> = []; // Log of notifications

  serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
  charUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'; // Character for receiving general data
  sendingPictureCharUUID = '2f47b012-ba1d-4a90-b28b-49ca6bcf2a8b'; // Character for picture transfer notification
  pictureDataCharUUID = '0193b6d1-4e1b-745d-ac16-ba9af8fbb405'; // Character for receiving picture data

  toggleAlertsCharUUID = '50c07f71-e239-4f5c-825e-2cc13e914778';

  // New properties for markers and static map URL
  private markers: any[] = []; // Updated to `any` type
  private staticMapUrl: string = '';

  private imageBuffer: Uint8Array = new Uint8Array(0); // Buffer to store received image data
  private totalBytesToReceive: number = 0;
  private bytesReceived: number = 0;

  constructor(private router: Router) {
    BleClient.initialize().then(() => {
      this.logTrace('BLE initialized');
    });

    // Request permissions for local notifications
    LocalNotifications.requestPermissions().then((permission) => {
      if (permission.display === 'granted') {
        this.logTrace('Notification permissions granted.');
      } else {
        this.logTrace('Notification permissions denied.');
      }
    });
  }

  logTrace(log: string) {
    if (this.errLog) {
      const currentTime = new Date(); // Log the notification

      this.notificationLog.push({
        value: 0,
        timestamp: currentTime,
        log: log,
      });
    }
  }

  // Scan for Bluetooth devices
  async scanDevices() {
    this.isScanning = true;
    this.devices = [];
    BleClient.requestLEScan({}, (result) => {
      this.logTrace('Found device:' + result);
      this.devices.push(result.device);
    });

    setTimeout(() => {
      BleClient.stopLEScan();
      this.isScanning = false;
      this.logTrace('Scanning stopped. Devices found:' + this.devices);
    }, 5000);
  }

  // Connect to a device
  async connect(deviceId: string) {
    await BleClient.connect(deviceId);
    this.connectedDevice = deviceId;

    // Update connection status using the BehaviorSubject
    this._isConnectedSubject.next(true);

    await this.startNotifications(deviceId);
    this.router.navigateByUrl('/tabs/alerts');
  }

  // Disconnect from a device
  async disconnect() {
    if (this.connectedDevice) {
      await BleClient.disconnect(this.connectedDevice);
      this.connectedDevice = null;
      // Update connection status using the BehaviorSubject
      this._isConnectedSubject.next(false);
      this.router.navigateByUrl('/scan');
    }
  }

  async startNotifications(deviceId: string) {
    const startNotificationsPromises = [
      BleClient.startNotifications(
        deviceId,
        this.serviceUUID,
        this.sendingPictureCharUUID, // Listen for picture transfer notifications
        async (value) => {
          /// Handle picture transfer notification
          //this.logTrace('Picture transfer notification received');

          const buffer = new Uint8Array(value.buffer);

          // Assuming totalBytesToReceive is sent as a 4-byte unsigned integer (32 bits) and in little-endian order
          this.totalBytesToReceive =
            buffer[3] * 2 ** 24 +
            buffer[2] * 2 ** 16 +
            buffer[1] * 2 ** 8 +
            buffer[0];
          this.logTrace(`Total bytes to receive: ${this.totalBytesToReceive}`);
          this.bytesReceived = 0;
          this.imageBuffer = new Uint8Array(this.totalBytesToReceive); // Allocate buffer for the entire image
        }
      ),
      BleClient.startNotifications(
        deviceId,
        this.serviceUUID,
        this.pictureDataCharUUID, // Listen for picture transfer notifications
        async (value) => {
          const receivedChunk = new Uint8Array(value.buffer); // Copy the received chunk into the correct position of the image buffer
          this.imageBuffer.set(receivedChunk, this.bytesReceived);
          this.bytesReceived += receivedChunk.length;
          this.logTrace(
            `Receiving chunk: ${receivedChunk.length}, total bytes received: ${this.bytesReceived}`
          );

          //this.logTrace(`Buffer: ${this.imageBuffer}`);
          // Check for end-of-transmission
          if (this.bytesReceived >= this.totalBytesToReceive) {
            // Image transfer complete
            try {
              this.logTrace(`Total bytes received: ${this.bytesReceived}`);
              const blob = new Blob([this.imageBuffer], {
                type: 'image/jpeg',
              });
              // Assuming JPEG image
              this.imageUrl = URL.createObjectURL(blob);

              // Clean up
              this.imageBuffer = new Uint8Array(0);
              this.totalBytesToReceive = 0;
              this.bytesReceived = 0; // Reset for next transfer
            } catch (error) {
              console.error('Error processing image:', error);
            }
          }
        }
      ),
      BleClient.startNotifications(
        deviceId,
        this.serviceUUID,
        this.charUUID, // Use the correct charUUID here
        async (value) => {
          const buffer = new Uint8Array(value.buffer); // Convert DataView to Uint8Array
          const alertValue = buffer[0]; // Assuming the alert value is a single byte
          const currentTime = new Date(); // Log the notification
          this.notificationLog.push({
            value: alertValue,
            timestamp: currentTime,
            log: '',
          });
          this.characteristicValueSubject.next('[' + alertValue + ']');
          this.logTrace(
            `Notification received: ${alertValue} at ${currentTime}`
          );

          // Emit an event for the new notification
          this.notificationSubject.next();

          // Schedule a local notification for the user
          try {
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: 'R3E Alert',
                  body: `Value: ${alertValue} received at ${currentTime.toLocaleTimeString()}`,
                  id: notificationIdCounter++, // Use an incrementing counter as ID
                  schedule: {
                    at: new Date(Date.now() + 1000), // Schedule 1 second later
                    allowWhileIdle: true, // Allow notification to appear even when the device is idle
                  },
                  sound: undefined, // No sound for this notification
                  attachments: undefined, // No attachments
                  actionTypeId: '', // No action required
                  extra: null, // Extra data (optional)
                },
              ],
            });
            this.logTrace('Notification scheduled successfully');
          } catch (error) {
            this.logTrace('Error scheduling notification:' + error);
          }
        }
      ),
    ];

    await Promise.all(startNotificationsPromises); // Wait for both notifications to start
    this.logTrace('Notifications started successfully');
  }

  // Write a value to toggle alerts
  async writeToggleAlerts() {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    //const byteValue = new Uint8Array(this.dn); // Convert boolean to byte
    const byteValue = new Uint8Array([this.dn]);

    const dataView = new DataView(byteValue.buffer); // Convert ArrayBuffer to DataView
    try {
      await BleClient.write(
        this.connectedDevice,
        this.serviceUUID,
        this.toggleAlertsCharUUID,
        dataView
      );
      console.log(`Toggled alerts: ${this.dn}`);
    } catch (error) {
      console.error('Failed to write toggle alerts value:', error);
    }
  }

  // Get the log of notifications
  getNotificationLog() {
    return this.notificationLog;
  }

  // Clear the notification log
  clearNotificationLog() {
    this.notificationLog = [];
    this.notificationSubject.next();
  }

  // Check if device number exists in the notification log
  hasDeviceInNotificationLog(deviceNumber: number): boolean {
    return this.notificationLog.some((log) => log.value === deviceNumber);
  }

  isConnected() {
    return this._isConnectedSubject.value;
    //return true;
  }

  // Save markers
  saveMarkers(markers: any[]) {
    this.markers = markers;
  }

  // Get markers
  getMarkers() {
    return this.markers;
  }

  // Get image URL
  getImageUrl() {
    return this.imageUrl;
  }

  // Save static map URL
  saveStaticMapUrl(url: string) {
    this.staticMapUrl = url;
  }

  // Get static map URL
  getStaticMapUrl() {
    if (this.staticMapUrl) return this.staticMapUrl;
    const markerLocations = this.markers
      .map((position, index) => {
        return `&markers=label:${index + 1}%7C${position.lat},${position.lng}`;
      })
      .join('');
    this.staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?key=${environment.googleMapsApiKey}&size=400x600&maptype=satellite&zoom=${this.mapZoom}${markerLocations}`;
    console.log();
    this.logTrace('Found Marker locations:' + markerLocations);
    return this.staticMapUrl;
  }

  updateStaticMap(ev: Event) {
    const zoomLvl = (ev as RangeCustomEvent).detail.value;
    const markerLocations = this.markers
      .map((position, index) => {
        return `&markers=label:${index + 1}%7C${position.lat},${position.lng}`;
      })
      .join('');
    this.staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?key=${environment.googleMapsApiKey}&size=400x600&maptype=satellite&zoom=${zoomLvl}${markerLocations}`;
    this.logTrace('Found Marker locations (upd):' + markerLocations);
    return this.staticMapUrl;
  }

  incDeviceNumber() {
    this.dn++;
    this._deviceNumberSubject.next(this.dn);
  }

  decDeviceNumber() {
    this.dn--;
    this._deviceNumberSubject.next(this.dn);
  }
}
