/*
 * RERO angular core
 * Copyright (C) 2022 RERO
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
export interface ILogger {

  /**
   * Info message
   * @param data - Any element
   * @param message - Message to be transmitted
   */
  info(data, message?: string): void;

  /**
   * Warning message
   * @param data - Any element
   * @param message - Message to be transmitted
   */
  warning(data, message?: string): void;

  /**
   * Error message
   * @param data - Any element
   * @param message - Message to be transmitted
   */
  error(data, message?: string): void;
}
