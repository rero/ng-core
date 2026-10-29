// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ISuggestionItem } from './remote-autocomplete.interface';
import { RemoteAutocompleteService } from './remote-autocomplete.service';

describe('RemoteAutocompleteService', () => {
  let service: RemoteAutocompleteService;

  beforeEach(() => {
    service = new RemoteAutocompleteService();
  });

  it('should return the suggestions', () => {
    service.getSuggestions('foo', {}, '1').subscribe((suggestions: ISuggestionItem[]) => {
      expect(suggestions).toEqual([{ label: 'test' }]);
    });
  });

  it('should return the html value', () => {
    service.getValueAsHTML({}, { label: 'test' }).subscribe((html: string) => {
      expect(html).toEqual('test');
    });
  });
});
