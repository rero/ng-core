// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { JSONSchema7 as JSONSchema7Base } from 'json-schema';

export interface JSONSchema7 extends JSONSchema7Base {
  widget: Record<string, any>;
  propertiesOrder?: string[];
}
