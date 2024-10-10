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
import { FormBuilder, FormControl, FormsModule } from '@angular/forms';
import { Validators } from './validators';

describe('Validators', () => {
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

  it('should return the value of the validator dateGreaterThan', () => {
    const validatorResponse = { dateGreaterThan: { value: true }};
    let formControl = new FormControl();
    let formGroup = formBuilder.group({
      start_date: new FormControl('2024-10-01'),
      end_date: new FormControl('2024-10-02')
    });
    formControl.setParent(formGroup);
    let result = Validators.dateGreaterThan('start_date', 'end_date')(formControl);
    expect(result).toBeNull();

    formControl = new FormControl();
    formGroup = formBuilder.group({
      start_date: new FormControl('2024-10-11'),
      end_date: new FormControl('2024-10-11')
    });
    formControl.setParent(formGroup);
    result = Validators.dateGreaterThan('start_date', 'end_date')(formControl);
    expect(result).toBeNull();

    formControl = new FormControl();
    formGroup = formBuilder.group({
      start_date: new FormControl('2024-10-11'),
      end_date: new FormControl('2024-10-11')
    });
    formControl.setParent(formGroup);
    // With strict mode
    result = Validators.dateGreaterThan('start_date', 'end_date', true)(formControl);
    expect(result).toEqual(validatorResponse);

    formControl = new FormControl();
    formGroup = formBuilder.group({
      start_date: new FormControl('2024-10-11'),
      end_date: new FormControl('2024-10-01')
    });
    formControl.setParent(formGroup);
    result = Validators.dateGreaterThan('start_date', 'end_date')(formControl);
    expect(result).toEqual(validatorResponse);
  });
});
