// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { capitalize, extractIdOnRef, removeChars } from './utils';

describe('Utils', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should evaluate /5 to 5', () => {
    const ref = 'ils.rero.ch/api/documents/5';
    expect(extractIdOnRef(ref)).toEqual('5');
  });

  it('should evaluate /28 to 28', () => {
    const ref = 'ils.rero.ch/api/documents/28';
    expect(extractIdOnRef(ref)).toEqual('28');
  });

  it('should evaluate /286 to 286', () => {
    const ref = 'ils.rero.ch/api/documents/286';
    expect(extractIdOnRef(ref)).toEqual('286');
  });

  it('should evaluate /9999 to 9999', () => {
    const ref = 'ils.rero.ch/api/documents/9999';
    expect(extractIdOnRef(ref)).toEqual('9999');
  });

  it('should evaluate /19999 to 19999', () => {
    const ref = 'ils.rero.ch/api/documents/19999';
    expect(extractIdOnRef(ref)).toEqual('19999');
  });

  it('should capitalize the value', () => {
    expect(capitalize('document')).toEqual('Document');
  });

  it('should return the string without the characters to be removed', () => {
    expect(removeChars('"House"')).toEqual('House');
    expect(removeChars('"House Philipp\'s"', ["'"])).toEqual('"House Philipps"');
  });

  it('should remove parentheses and backslashes by default', () => {
    expect(removeChars('foo (bar) baz')).toEqual('foo bar baz');
    expect(removeChars('foo\\bar')).toEqual('foobar');
  });

  it('should keep other Elasticsearch operators untouched by default', () => {
    expect(removeChars('title:foo AND +bar -baz*')).toEqual('title:foo AND +bar -baz*');
  });

  it('should treat a custom hyphen as a literal char, not a range', () => {
    expect(removeChars('abcxyz-', ['a', '-', 'z'])).toEqual('bcxy');
  });
});
