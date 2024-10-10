/*
 * RERO angular core
 * Copyright (C) 2024 RERO
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
import { TestBed } from '@angular/core/testing';
import { TimeValidator } from './time.validator';
import { FormBuilder, FormControl, FormsModule } from '@angular/forms';

describe('TimeValidator', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule
      ],
      providers: [
        FormBuilder
      ]
    });
    formBuilder = TestBed.inject(FormBuilder);
  });

  it('should return the value of the validator greaterThanValidator', () => {
    let formGroup = formBuilder.group({
      start_time: new FormControl('07:00'),
      end_time: new FormControl('08:00')
    });
    let result = TimeValidator.greaterThanValidator('start_time', 'end_time')(formGroup);
    expect(result).toBeNull();

    formGroup = formBuilder.group({
      start_time: new FormControl('12:00'),
      end_time: new FormControl('08:00')
    });
    result = TimeValidator.greaterThanValidator('start_time', 'end_time')(formGroup);
    expect(result).toEqual({ lessThan: { value: true }});
  });

  it('should return the value of the validator RangePeriodValidator', () => {
    const formGroup = formBuilder.group({
      'times': formBuilder.array([
        formBuilder.group({
          start_time: new FormControl('08:00'),
          end_time: new FormControl('11:00')
        }),
        formBuilder.group({
          start_time: new FormControl('13:00'),
          end_time: new FormControl('17:00')
        }),
      ]),
      'day': ['monday'],
      'is_open': true
    });
    let result = TimeValidator.RangePeriodValidator()(formGroup);
    expect(result).toBeNull();

    const formGroup2 = formBuilder.group({
      'times': formBuilder.array([
        formBuilder.group({
          start_time: new FormControl('08:00'),
          end_time: new FormControl('11:00')
        }),
        formBuilder.group({
          start_time: new FormControl('10:00'),
          end_time: new FormControl('12:00')
        }),
      ]),
      'day': ['monday'],
      'is_open': true
    });
    result = TimeValidator.RangePeriodValidator()(formGroup2);
    expect(result).toEqual({ rangeLessThan: { value: true }});

    const formGroup3 = formBuilder.group({
      'times': formBuilder.array([
        formBuilder.group({
          start_time: new FormControl('14:00'),
          end_time: new FormControl('16:00')
        }),
        formBuilder.group({
          start_time: new FormControl('13:00'),
          end_time: new FormControl('15:00')
        }),
      ]),
      'day': ['monday'],
      'is_open': true
    });
    result = TimeValidator.RangePeriodValidator()(formGroup3);
    expect(result).toEqual({ rangeLessThan: { value: true }});
  });
});
