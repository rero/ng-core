// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { searchTotalValue } from './record-search-utils';

describe('searchTotalValue', () => {
  it('should return the number as is', () => {
    expect(searchTotalValue(0)).toBe(0);
    expect(searchTotalValue(42)).toBe(42);
  });

  it('should extract the value of an object total', () => {
    expect(searchTotalValue({ relation: 'eq', value: 12 })).toBe(12);
    expect(searchTotalValue({ relation: 'gte', value: 0 })).toBe(0);
  });

  it('should parse a string total', () => {
    expect(searchTotalValue('12')).toBe(12);
    expect(searchTotalValue(' 12 ')).toBe(12);
    expect(searchTotalValue('0')).toBe(0);
  });

  it('should return 0 when the total is missing', () => {
    expect(searchTotalValue()).toBe(0);
    expect(searchTotalValue(undefined)).toBe(0);
  });

  it('should return 0 when the total is negative', () => {
    expect(searchTotalValue(-1)).toBe(0);
    expect(searchTotalValue(-42)).toBe(0);
    expect(searchTotalValue('-1')).toBe(0);
    expect(searchTotalValue(' -42 ')).toBe(0);
    expect(searchTotalValue({ relation: 'eq', value: -1 })).toBe(0);
  });

  it('should return 0 when the total is not parsable', () => {
    expect(searchTotalValue('')).toBe(0);
    expect(searchTotalValue('   ')).toBe(0);
    expect(searchTotalValue('foo')).toBe(0);
    expect(searchTotalValue(Number.NaN)).toBe(0);
  });
});
