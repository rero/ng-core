// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { computed, Injectable, resource } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CameraDetectionService {
  private readonly cameraDevices = resource({
    loader: async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        return false;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === 'videoinput');
    },
  });

  readonly hasCamera = computed(() => this.cameraDevices.value() ?? false);
}
