/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { TestBed, tick, fakeAsync } from '@angular/core/testing';

import { LocalStorageService, LocalStorageEvent } from './local-storage.service';

describe('LocalStorageService', () => {

  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(LocalStorageService);
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

  it('should update date on local storage data', fakeAsync(() => {
    service.set('local', { name: 'test' });
    const currentDate = new Date(service.get('local', 'date'));
    tick(10000);
    service.updateDate('local');
    expect(new Date(service.get('local', 'date')) > currentDate).toBeTruthy();
    service.clear();
  }));

  it('should expired data on local storage', fakeAsync(() => {
    service.set('local', { name: 'test' });
    tick(10000);
    expect(service.isExpired('local', 0)).toBeTruthy();
    service.clear();
  }));

  it('should is expired data on local storage', fakeAsync(() => {
    service.set('local', { name: 'test' });
    tick(10000);
    expect(service.isExpired('local', 30)).toBeFalsy();
    service.clear();
  }));

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
      expect(event.data.data).toEqual(data);
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
