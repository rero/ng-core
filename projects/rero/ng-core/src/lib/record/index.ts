/*
 * RERO angular core
 * Copyright (C) 2022-2026 RERO
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

export * from "./pipe/get-record.pipe";
export * from "./record.routes";
export * from "./component/autocomplete/search-autocomplete.component";
export * from "./component/search/record-search-page.component";
export * from "./component/search/record-search/aggregation/buckets/bucket-name.pipe";
export * from "./component/search/record-search/aggregation/buckets/buckets.component";
export * from "./component/search/record-search/aggregation/aggregation.component";
export * from "./component/search/record-search/aggregation/slider/slider.component";
export * from "./component/search/record-search/aggregation/date-range/date-range.component";
export * from "./component/search/record-search/aggregation/list-filters/list-filters.component";
export * from "./model/result-item.interface";
export * from "./component/search/record-search/menu-sort/menu-sort.component";
export * from "./component/search/record-search/export-button/export-button.component";
export * from "./component/search/record-search/record-search.component";
export * from "./component/search/record-search/search-filters/search-filters.component";
export * from "./component/search/record-search/search-tabs/search-tabs.component";
export * from "./component/search/record-search/paginator/paginator.component";
export * from "./component/search/record-search/record-search-result/record-search-result.component";
export * from "./component/search/record-search/record-search-result/default-search-result/default-search-result.component";
export * from "./component/search/store/record-search.store";
export * from "./component/search/model/aggregations-filter.interface";
export * from "./component/detail/detail-record.interface";
export * from "./component/detail/detail-button/record-action-event.interface";
export * from "./component/detail/detail-button/detail-button.component";
export * from "./component/detail/detail.component";
export * from "./component/detail/default-detail/default-detail.component";
export * from "./component/detail/detail.directive";
export * from "./service/record/record.service";
export * from "./service/record-handle-error/record-handle-error.service";
export * from "./service/api/api.service";
export * from "./service/record-ui/record-ui.service";
export * from "./editor/component/save-template-form/save-template-form.component";
export * from "./editor/component/load-template-form/load-template-form.component";
export * from "./editor/component/editor/editor.component";
export * from "./editor/utils/utils";
export * from "./editor/services/template/templates.service";
export * from "./editor/services/jsonschema/jsonschema.service";
export * from "./record-search-utils"
