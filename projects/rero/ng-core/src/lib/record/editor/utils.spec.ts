/*
 * RERO angular core
 * Copyright (C) 2022-2024 RERO
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

import { TestBed } from '@angular/core/testing';
import { processJsonSchema, resolve$ref } from './utils';

describe('EditorUtils', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('Process Json Schema', () => {
    const schema = {
      schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      title: "Test editor",
      additionalProperties: false,
      required: [
        "withRequired"
      ],
      properties: {
        withoutRequired: {
          title: "Without required",
          type: "string"
        },
        withRequired: {
          title: "With Required",
          type: "string"
        }
      }
    };

    const schemaProcessed = {
      schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      title: "Test editor",
      additionalProperties: false,
      required: [
        "withRequired"
      ],
      properties: {
        withoutRequired: {
          title: "Without required",
          type: "string"
        },
        withRequired: {
          title: "With Required",
          type: "string",
          widget: {
            formlyConfig: {
              props: {
                initialRequired: true
              }
            }
          }
        }
      }
    };

    expect(processJsonSchema(schema)).toEqual(schemaProcessed);
  });

  it('Resolve $ref definition in jsonschema', () => {
    const schema = {
      schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Bibliographic Document',
      type: 'object',
      properties: {
        simpleDef: {
          title: 'simple field',
          type: 'string',
          $ref: '#/definition/simple_field'
        },
        objectField: {
          title: 'Object field',
          properties: {
            objectDef: {
              title: 'Object field def',
              type: 'string',
              $ref: '#/definition/simple_field'
            },
            address: {
              type: 'object',
              properties: {
                object2Def: {
                  title: 'Object 2 field def',
                  type: 'string',
                  $ref: '#/definition/simple_field'
                }
              }
            }
          }
        }
      },
      definition: {
        simple_field: {
          title: 'simple field (def)',
          type: 'string',
          widget: {
            formlyConfig: {
              type: 'textarea',
              templateOptions: {
                rows: 5
              }
            }
          }
        }
      }
    };

    const schemaResult = {
      schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Bibliographic Document',
      type: 'object',
      properties: {
        simpleDef: {
          title: 'simple field (def)',
          type: 'string',
          widget: {
            formlyConfig: {
              type: 'textarea',
              props: {
                rows: 5
              }
            }
          }
        },
        objectField: {
          title: 'Object field',
          properties: {
            objectDef: {
              title: 'simple field (def)',
              type: 'string',
              widget: {
                formlyConfig: {
                  type: 'textarea',
                  props: {
                    rows: 5
                  }
                }
              }
            },
            address: {
              type: 'object',
              properties: {
                object2Def: {
                  title: 'simple field (def)',
                  type: 'string',
                  widget: {
                    formlyConfig: {
                      type: 'textarea',
                      props: {
                        rows: 5
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      definition: {
        simple_field: {
          title: 'simple field (def)',
          type: 'string',
          widget: {
            formlyConfig: {
              type: 'textarea',
              props: {
                rows: 5
              }
            }
          }
        }
      }
    };

    expect(resolve$ref(schema, schema.properties)).toEqual(schemaResult);
  });
});
