// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface EditorTemplateSettings {
  recordType: string;
  loadFromTemplate: boolean;
  saveAsTemplate: boolean;
}

export interface EditorSettingsConfig {
  longMode?: boolean;
  getHeaders?: unknown;
  template?: Partial<EditorTemplateSettings>;
}
