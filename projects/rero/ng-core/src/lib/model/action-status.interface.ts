// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Interface representing an action status for permission check.
 */
export interface ActionStatus {
  can: boolean;
  message: string;
  url?: string;
  routerLink?: string[];
  type?: string;
}

export const DEFAULT_ACTION_STATUS: ActionStatus = {
  can: true,
  message: '',
};
