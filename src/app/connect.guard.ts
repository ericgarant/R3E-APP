import { inject } from '@angular/core';
import { BluetoothService } from './bluetooth.service';
import { Router } from '@angular/router';

import { CanActivateFn } from '@angular/router';

export const connectGuard: CanActivateFn = (route, state) => {
  const bleService = inject(BluetoothService);
  const router = inject(Router);


  if (bleService.isConnected()) {
    return true;  // Allow access to the route
  } else {
    // Redirect to the scan page if no device is connected
    return router.createUrlTree(['/scan']);
  }
};
