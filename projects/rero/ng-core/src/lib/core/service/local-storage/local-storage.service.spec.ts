// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { LocalStorageEvent, LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set local storage data', () => {
    const data = { name: 'test' };
    service.set('local', data);
    expect(service.get('local')).toEqual(data);
    service.clear();
  });

  it('should update date on local storage data', async () => {
    service.set('local', { name: 'test' });
    const currentDate = new Date(service.get('local', 'date'));
    await new Promise((resolve) => setTimeout(resolve, 50));
    service.updateDate('local');
    expect(new Date(service.get('local', 'date')) > currentDate).toBeTruthy();
    service.clear();
  });

  it('should expired data on local storage', async () => {
    service.set('local', { name: 'test' });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(service.isExpired('local', 0)).toBeTruthy();
    service.clear();
  });

  it('should is expired data on local storage', async () => {
    service.set('local', { name: 'test' });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(service.isExpired('local', 30)).toBeFalsy();
    service.clear();
  });

  it('should key exist on local storage', () => {
    service.set('local', { name: 'test' });
    expect(service.has('local')).toBeTruthy();
    service.clear();
  });

  it('should remove a key on local storage', () => {
    service.set('local', { name: 'test' });
    expect(service.has('local')).toBeTruthy();
    service.remove('local');
    expect(service.has('local')).toBeFalsy();
    service.clear();
  });

  it('should clear local storage', () => {
    service.set('local', { name: 'test' });
    service.clear();
    expect(service.has('local')).toBeFalsy();
  });

  it('should check if event onSet is notified', () => {
    const data = { name: 'test' };
    const onSetEvent = service.onSet$.subscribe((event: LocalStorageEvent) => {
      expect(event.key).toEqual('local');
      expect((event.data as any).data).toEqual(data);
    });
    service.set('local', data);
    onSetEvent.unsubscribe();
  });

  it('should check if event onRemove is notified', () => {
    const onRemoveEvent = service.onRemove$.subscribe((event: any) => {
      expect(event).toBeNull();
    });
    service.set('local', {});
    service.remove('local');
    onRemoveEvent.unsubscribe();
  });

  it('should check if event onClear is notified', () => {
    const onClearEvent = service.onClear$.subscribe((event: any) => {
      expect(event).toBeNull();
    });
    service.set('local', {});
    service.clear();
    onClearEvent.unsubscribe();
  });
});
