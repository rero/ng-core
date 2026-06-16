// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Interface representing an error.
 */
export interface Error {
  status: number;
  title: string;
  message?: string;
}
