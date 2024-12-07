import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BluetoothService } from '../bluetooth.service';
import { Subscription } from 'rxjs';

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
  IonSpinner,
} from '@ionic/angular/standalone';

import { environment } from 'src/environments/environment'; // Import environment variables

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
  standalone: true,
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
    IonSpinner,
  ],
})
export class LocationPage implements AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;
  map!: any;
  gm!: any;
  private geoWatchId: any; // Store the watch ID for clearing the watch
  loading: boolean = false; // State variable for loading
  private markerObjects: any[] = []; // Store the map marker objects
  private notificationSubscription: Subscription = new Subscription(); // Subscription to notifications

  constructor(
    private renderer: Renderer2,
    public bleService: BluetoothService
  ) {}

  ngAfterViewInit() {
    this.getGoogleMaps()
      .then((googleMaps) => {
        this.gm = googleMaps;
        const mapEl = this.mapElementRef.nativeElement;
        this.map = new googleMaps.Map(mapEl, {
          center: { lat: 45.314224, lng: -72.186433 },
          zoom: 16,
          mapId: environment.mapId, // Use environment variable for map ID
        });

        googleMaps.event.addListenerOnce(this.map, 'idle', () => {
          this.renderer.addClass(mapEl, 'visible');
        });

        // Subscribe to notification updates
        this.notificationSubscription = this.bleService.notification$.subscribe(
          () => {
            this.updateMapMarkers();
          }
        );

        // Add a click listener to the map
        this.map.addListener(
          'click',
          (event: { latLng: { lat: () => any; lng: () => any } }) => {
            const selectedCoords = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            };
            console.log(selectedCoords);
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  ngOnDestroy() {
    // Cleanup: Clear the position watch when the component is destroyed
    if (this.geoWatchId) {
      navigator.geolocation.clearWatch(this.geoWatchId);
    }
    // Unsubscribe from notifications
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    console.log('ON DESTROY');
  }

  updateMapMarkers() {
    // Clear existing markers
    this.markerObjects.forEach((marker) => marker.setMap(null));
    this.markerObjects = [];
    // Add markers from the list
    this.bleService.getMarkers().forEach((position, index) => {
      const pinElement = new this.gm.marker.PinElement({
        glyph: `${index}`,
        glyphColor: 'white',
        background: this.bleService
          .getNotificationLog()
          .some((log) => log.value === index)
          ? 'red'
          : 'blue',
        borderColor: 'black',
      });

      const marker = new this.gm.marker.AdvancedMarkerElement({
        map: this.map,
        position: { lat: position.lat, lng: position.lng },
        title: `Device #${index + 1}`,
        content: pinElement.element,
        gmpDraggable: true,
      });
      marker.addListener('dragend', (event: any) => {
        const newPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        this.bleService.getMarkers()[index] = newPosition;
        console.log(`Marker #${index + 1} moved to:`, newPosition);
      });
      this.markerObjects.push(marker);
    });
  }

  addCurrentPositionMarker() {
    this.loading = true; // Set loading to true when map starts loading

    if (navigator.geolocation) {
      // Use watchPosition for continuous updates
      this.geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Recenter map to new position
          this.map.setCenter(currentPos);
          // Add marker to the marker array (assuming `getMarkers()` returns an array)
          this.bleService.getMarkers().push(currentPos);

          // Update map markers
          this.updateMapMarkers();
          if (this.geoWatchId) {
            navigator.geolocation.clearWatch(this.geoWatchId);
          }
          this.loading = false;
        },
        (error) => {
          console.error('Error getting location: ', error);
        },
        {
          enableHighAccuracy: true, // Use high accuracy (can be set to false if accuracy is not needed)
          timeout: 100, // Maximum time to wait for the position
          maximumAge: 0, // Don't use cached position
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      this.loading = false;
    }
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&v=3.50&libraries=marker`; // Use environment variable for API key
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available.');
        }
      };
    });
  }
}
