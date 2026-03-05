/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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

import { TestBed } from "@angular/core/testing";
import { TranslateLabelService } from "./translate-label.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

describe('TranslateLabelService', () => {
  let service: TranslateLabelService;
  let translate: TranslateService

  const optionsItems = [
    {
      label: 'Value 1',
      value: 'value1',
      untranslatedLabel: 'Value 1',
      items: [
        {
          label: 'Value 2',
          value: 'value2',
          untranslatedLabel: 'Value 2',
          items: [
            {
              label: 'Value 3',
              value: 'value3',
              untranslatedLabel: 'Value 3'
            }
          ]
        }
      ]
    }
  ];

  const optionsChildren = [
    {
      label: 'Value 1',
      value: 'value1',
      untranslatedLabel: 'Value 1',
      children: [
        {
          label: 'Value 2',
          value: 'value2',
          untranslatedLabel: 'Value 2',
          children: [
            {
              label: 'Value 3',
              value: 'value3',
              untranslatedLabel: 'Value 3'
            }
          ]
        }
      ]
    }
  ];

  const translateFrench = {
    "Value 1": "Valeur 1",
    "Value 2": "Valeur 2",
    "Value 3": "Valeur 3"
  };

  const translateGerman = {
    "Value 1": "Wert 1",
    "Value 2": "Wert 2",
    "Value 3": "Wert 3"
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        TranslateLabelService
      ]
    });

    service = TestBed.inject(TranslateLabelService);
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('fr', translateFrench);
    translate.setTranslation('de', translateGerman);
  });

  it('should translate cascading labels with items', () => {
    translate.use('fr');
    let translatedLabels = service.translateLabel(optionsItems);
    expect(translatedLabels[0].label).toEqual('Valeur 1');
    expect(translatedLabels[0].items[0].label).toEqual('Valeur 2');
    expect(translatedLabels[0].items[0].items[0].label).toEqual('Valeur 3');

    translate.use('de');
    translatedLabels = service.translateLabel(optionsItems);
    expect(translatedLabels[0].label).toEqual('Wert 1');
    expect(translatedLabels[0].items[0].label).toEqual('Wert 2');
    expect(translatedLabels[0].items[0].items[0].label).toEqual('Wert 3');
  });

  it('should translate cascading labels with children', () => {
    translate.use('fr');
    const translatedLabels = service.translateLabel(optionsChildren);
    expect(translatedLabels[0].label).toEqual('Valeur 1');
    expect(translatedLabels[0].children[0].label).toEqual('Valeur 2');
    expect(translatedLabels[0].children[0].children[0].label).toEqual('Valeur 3');
  });
});
