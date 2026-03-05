import { ParamMap } from "@angular/router";
import { SearchParams } from "./model";
import { AggregationsFilter } from "../../public-api";

export function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  // null / undefined / primitive mismatch
  if (
    a === null ||
    b === null ||
    typeof a !== 'object' ||
    typeof b !== 'object'
  ) {
    return false;
  }

  // Arrays
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return false;
    }

    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (!shallowEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Objects
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;

  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!(key in bObj)) return false;
    if (!shallowEqual(aObj[key], bObj[key])) return false;
  }

  return true;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != undefined)
  ) as Partial<T>;
}

export function paramMapToSearchParams(
  map: ParamMap
): Partial<SearchParams> {
  const aggregationsFilters: AggregationsFilter[] = [];
  map.keys.forEach((key: string) => {
    if (['q', 'page', 'size', 'sort', 'index'].includes(key) === false) {
      const values = map.getAll(key);
      aggregationsFilters.push({ key, values });
    }
  });
  return stripUndefined<object>({
    q: (map.get('q') != null) ? map.get('q') : undefined,
    page: map.get('page') ? +map.get('page')! : undefined,
    size: map.get('size') ? +map.get('size')! : undefined,
    sort: (map.get('sort') != null) ? map.get('sort') : undefined,
    index: (map.get('index') != null) ? map.get('index') : undefined,
    aggregationsFilters: aggregationsFilters,
    searchFields: [],
    searchFilters: [],
  });
}

export function searchParamsToUrlParams(
  params: SearchParams, aggregationsFilters: AggregationsFilter[]
): Record<string, unknown> {
  const urlParams: Record<string, unknown> = stripUndefined({
    q: params.q,
    page: params.page,
    size: params.size,
    sort: params.sort,
  });
  aggregationsFilters.forEach(filter =>
      urlParams[filter.key] = filter.values
  );
  return urlParams;
}
