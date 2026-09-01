// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { CameraDetectionService } from './camera-detection.service';

function mockMediaDevices(devices: MediaDeviceInfo[] | undefined): void {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: devices === undefined ? undefined : { enumerateDevices: () => Promise.resolve(devices) },
    configurable: true,
  });
}

function makeDeviceInfo(kind: MediaDeviceKind): MediaDeviceInfo {
  return { kind } as MediaDeviceInfo;
}

describe('CameraDetectionService', () => {
  let service: CameraDetectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    mockMediaDevices([]);
    service = TestBed.inject(CameraDetectionService);
    expect(service).toBeTruthy();
  });

  it('should detect a video input device', async () => {
    mockMediaDevices([makeDeviceInfo('videoinput')]);
    service = TestBed.inject(CameraDetectionService);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(service.hasCamera()).toBe(true);
  });

  it('should report no camera when only other device kinds are available', async () => {
    mockMediaDevices([makeDeviceInfo('audioinput')]);
    service = TestBed.inject(CameraDetectionService);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(service.hasCamera()).toBe(false);
  });

  it('should report no camera when enumerateDevices is unsupported', async () => {
    mockMediaDevices(undefined);
    service = TestBed.inject(CameraDetectionService);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(service.hasCamera()).toBe(false);
  });
});
