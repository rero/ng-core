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

import { TestBed } from '@angular/core/testing';
import { LoggerService } from '../../service/logger.service';
import { formToWidget } from './utils';

describe('EditorUtils', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const schema = {
    schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Bibliographic Document',
    type: 'object',
    required: [
      '$schema'
    ],
    propertiesOrder: [
      'on_any_all'
    ],
    additionalProperties: false,
    properties: {
      $schema: {
        title: 'Schema',
        description: 'Schema to validate document against.',
        type: 'string',
        default: 'https://bib.rero.ch/schemas/documents/document-v0.0.1.json'
      },
      on_any_all: {
        title: 'oneOf, anyOf, anyAll',
        description: '(MARC 655)',
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          title: 'Title',
          oneOf: [
            {
              title: 'oneOf',
              type: 'object',
              additionalProperties: false,
              required: [
                'title'
              ],
              properties: {
                agent: {
                  title: 'Agent',
                  type: 'object',
                  oneOf: [
                    {
                      title: 'Person',
                      type: 'object',
                      additionalProperties: false,
                      propertiesOrder: [
                        'preferred_name',
                        'type',
                        'identifiedBy'
                      ],
                      required: [
                        'type',
                        'preferred_name'
                      ],
                      properties: {
                        type: {
                          title: 'Type',
                          type: 'string',
                          readOnly: true,
                          default: 'bf:Person',
                          const: 'bf:Person',
                          form: {
                            templateOptions: {
                              wrappers: [
                                'hide'
                              ]
                            }
                          }
                        },
                        preferred_name: {
                          title: 'Name',
                          type: 'string',
                          minLength: 1,
                          form: {
                            placeholder: 'Example: M\u00fcller, Hans',
                            templateOptions: {
                              itemCssClass: 'col-lg-6'
                            }
                          }
                        },
                        identifiedBy: {
                          title: 'Identifiers',
                          type: 'array',
                          minItems: 1,
                          items: {
                            title: 'Identifier',
                            type: 'object',
                            required: [
                              'type',
                              'value'
                            ],
                            propertiesOrder: [
                              'type',
                              'value'
                            ],
                            additionalProperties: false,
                            properties: {
                              type: {
                                title: 'Type',
                                type: 'string',
                                enum: [
                                  'bf:AudioIssueNumber',
                                  'bf:Doi'
                                ],
                                form: {
                                  type: 'selectWithSort',
                                  options: [
                                    {
                                      label: 'Audio Issue Number',
                                      value: 'bf:AudioIssueNumber'
                                    },
                                    {
                                      label: 'Doi',
                                      value: 'bf:Doi'
                                    }
                                  ],
                                  templateOptions: {
                                    itemCssClass: 'col-lg-6'
                                  }
                                }
                              },
                              value: {
                                title: 'Identifier value',
                                type: 'string',
                                minLength: 1,
                                form: {
                                  templateOptions: {
                                    itemCssClass: 'col-lg-6',
                                    doNotSubmitOnEnter: true
                                  }
                                }
                              },
                              note: {
                                title: 'Note',
                                type: 'string',
                                minLength: 1,
                                form: {
                                  hide: true,
                                  templateOptions: {
                                    itemCssClass: 'col-lg-6'
                                  }
                                }
                              }
                            },
                            form: {
                              templateOptions: {
                                containerCssClass: 'row'
                              }
                            }
                          },
                          form: {
                            hide: true,
                            navigation: {
                              essential: true
                            }
                          }
                        }
                      },
                      form: {
                        templateOptions: {
                          containerCssClass: 'row'
                        }
                      }
                    },
                  ]
                },
                title: {
                  title: 'Title',
                  type: 'string',
                  minLength: 3
                }
              }
            }
          ],
          anyOf: [
            {
              title: 'anyOf',
              type: 'object',
              additionalProperties: false,
              required: [
                'title'
              ],
              properties: {
                title: {
                  title: 'title',
                  form: {
                    placeholder: 'placeholder title'
                  }
                }
              }
            }
          ],
          allOf: [
            {
              title: 'allOf',
              type: 'object',
              additionalProperties: false,
              required: [
                'title'
              ],
              properties: {
                title: {
                  title: 'title',
                  form: {
                    templateOptions: {
                      wrappers: [
                        'hide'
                      ]
                    }
                  }
                }
              }
            }
          ]
        }
      },
      test_form_widget: {
        title: 'test form to widget',
        form: {
          fieldMap: 'amount',
          hide: true,
          focus: true,
          placeholder: 'test form placeholder',
          helpURL: 'https://localhost/help',
          templateOptions: {
            label: '',
            cssClass: 'w-md-50',
            itemCssClass: 'col-12',
            wrappers: [
              'hide'
            ],
            addonRight: {
              text: '%'
            },
            doNotSubmitOnEnter: true,
            rows: 3,
            selectWithSortOptions: {
              order: 'label'
            },
            'toggle-switch': {
              label: 'Allow',
              description: 'allowed or not.'
            }
          },
          type: 'selectWithSort',
          options: [
            {
              label: 'Foo',
              value: 'Bar'
            }
          ],
          remoteOptions: {
            type: 'vendors'
          },
          remoteTypeahead: {
            type: 'typehead',
            enableGroupfield: true
          },
          expressionProperties: {
            'templateOptions.required': true
          },
          hideExpression: true,
          navigation: {
            essential: true
          },
          validation: {
            validators: {
              valueAlreadyExists: {
                term: 'name.raw'
              },
              uniqueValueKeysInObject: {
                keys: ['type']
              }
            }
          }
        }
      },
      test_widget: {
        title: 'Test with the widget field defined',
        widget: {
          formlyConfig: {
            templateOptions: {
              remoteOptions: {
                type: 'vendors'
              }
            }
          }
        },
        form: {
          remoteTypeahead: {
            type: 'typehead',
            enableGroupfield: true
          }
        }
      },
      test_widget_not_formly_config: {
        title: 'Test with the widget and not formly config',
        widget: {
          foot: 'bar'
        },
        form: {
          remoteOptions: {
            type: 'vendors'
          }
        }
      }
    }
  };

  const schemaWidget = {
    schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Bibliographic Document',
    type: 'object',
    required: [
      '$schema'
    ],
    propertiesOrder: [
      'on_any_all'
    ],
    additionalProperties: false,
    properties: {
      $schema: {
        title: 'Schema',
        description: 'Schema to validate document against.',
        type: 'string',
        default: 'https://bib.rero.ch/schemas/documents/document-v0.0.1.json',
        widget: {
          formlyConfig: {
            templateOptions: {
              initialRequired: true
            }
          }
        }
      },
      on_any_all: {
        title: 'oneOf, anyOf, anyAll',
        description: '(MARC 655)',
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          title: 'Title',
          oneOf: [
            {
              title: 'oneOf',
              type: 'object',
              additionalProperties: false,
              required: [
                'title'
              ],
              properties: {
                agent: {
                  title: 'Agent',
                  type: 'object',
                  oneOf: [
                    {
                      title: 'Person',
                      type: 'object',
                      additionalProperties: false,
                      propertiesOrder: [
                        'preferred_name',
                        'type',
                        'identifiedBy'
                      ],
                      required: [
                        'type',
                        'preferred_name'
                      ],
                      properties: {
                        type: {
                          title: 'Type',
                          type: 'string',
                          readOnly: true,
                          default: 'bf:Person',
                          const: 'bf:Person',
                          widget: {
                            formlyConfig: {
                              wrappers: [
                                'hide'
                              ],
                              templateOptions: {
                                initialRequired: true
                              }
                            }
                          }
                        },
                        preferred_name: {
                          title: 'Name',
                          type: 'string',
                          minLength: 1,
                          widget: {
                            formlyConfig: {
                              templateOptions: {
                                initialRequired: true,
                                placeholder: 'Example: M\u00fcller, Hans',
                                itemCssClass: 'col-lg-6'
                              }
                            }
                          }
                        },
                        identifiedBy: {
                          title: 'Identifiers',
                          type: 'array',
                          minItems: 1,
                          items: {
                            title: 'Identifier',
                            type: 'object',
                            required: [
                              'type',
                              'value'
                            ],
                            propertiesOrder: [
                              'type',
                              'value'
                            ],
                            additionalProperties: false,
                            properties: {
                              type: {
                                title: 'Type',
                                type: 'string',
                                enum: [
                                  'bf:AudioIssueNumber',
                                  'bf:Doi'
                                ],
                                widget: {
                                  formlyConfig: {
                                    type: 'selectWithSort',
                                    templateOptions: {
                                      initialRequired: true,
                                      options: [
                                        {
                                          label: 'Audio Issue Number',
                                          value: 'bf:AudioIssueNumber'
                                        },
                                        {
                                          label: 'Doi',
                                          value: 'bf:Doi'
                                        }
                                      ],
                                      itemCssClass: 'col-lg-6'
                                    }
                                  }
                                }
                              },
                              value: {
                                title: 'Identifier value',
                                type: 'string',
                                minLength: 1,
                                widget: {
                                  formlyConfig: {
                                    templateOptions: {
                                      initialRequired: true,
                                      itemCssClass: 'col-lg-6',
                                      doNotSubmitOnEnter: true
                                    }
                                  }
                                }
                              },
                              note: {
                                title: 'Note',
                                type: 'string',
                                minLength: 1,
                                widget: {
                                  formlyConfig: {
                                    templateOptions: {
                                      hide: true,
                                      itemCssClass: 'col-lg-6'
                                    }
                                  }
                                }
                              }
                            },
                            widget: {
                              formlyConfig: {
                                templateOptions: {
                                  containerCssClass: 'row'
                                }
                              }
                            }
                          },
                          widget: {
                            formlyConfig: {
                              templateOptions: {
                                hide: true,
                                navigation: {
                                  essential: true
                                }
                              }
                            }
                          }
                        }
                      },
                      widget: {
                        formlyConfig: {
                          templateOptions: {
                            containerCssClass: 'row'
                          }
                        }
                      }
                    },
                  ]
                },
                title: {
                  title: 'Title',
                  type: 'string',
                  minLength: 3,
                  widget: {
                    formlyConfig: {
                      templateOptions: {
                        initialRequired: true
                      }
                    }
                  }
                }
              }
            }
          ],
          anyOf: [
            {
              title: 'anyOf',
              type: 'object',
              additionalProperties: false,
              required: [
                'title'
              ],
              properties: {
                title: {
                  title: 'title',
                  widget: {
                    formlyConfig: {
                      templateOptions: {
                        initialRequired: true,
                        placeholder: 'placeholder title'
                      }
                    }
                  }
                }
              }
            }
          ],
          allOf: [
            {
              title: 'allOf',
              type: 'object',
              additionalProperties: false,
              required: [
                'title'
              ],
              properties: {
                title: {
                  title: 'title',
                  widget: {
                    formlyConfig: {
                      wrappers: ['hide'],
                      templateOptions: {
                        initialRequired: true
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      },
      test_form_widget: {
        title: 'test form to widget',
        widget: {
          formlyConfig: {
            focus: true,
            type: 'selectWithSort',
            templateOptions: {
              hide: true,
              fieldMap: 'amount',
              label: '',
              placeholder: 'test form placeholder',
              helpURL: 'https://localhost/help',
              cssClass: 'w-md-50',
              itemCssClass: 'col-12',
              options: [
                {
                  label: 'Foo',
                  value: 'Bar'
                }
              ],
              addonRight: {
                text: '%'
              },
              doNotSubmitOnEnter: true,
              rows: 3,
              selectWithSortOptions: {
                order: 'label'
              },
              'toggle-switch': {
                label: 'Allow',
                description: 'allowed or not.'
              },
              navigation: {
                essential: true
              },
              remoteOptions: {
                type: 'vendors'
              },
              remoteTypeahead: {
                type: 'typehead',
                enableGroupfield: true
              },
              validation: {
                validators: {
                  valueAlreadyExists: {
                    term: 'name.raw'
                  },
                  uniqueValueKeysInObject: {
                    keys: ['type']
                  }
                }
              }
            },
            wrappers: ['hide'],
            expressionProperties: {
              'templateOptions.required': true
            },
            hideExpression: true
          }
        }
      },
      test_widget: {
        title: 'Test with the widget field defined',
        widget: {
          formlyConfig: {
            templateOptions: {
              remoteOptions: {
                type: 'vendors'
              },
              remoteTypeahead: {
                type: 'typehead',
                enableGroupfield: true
              }
            }
          }
        }
      },
      test_widget_not_formly_config: {
        title: 'Test with the widget and not formly config',
        widget: {
          foot: 'bar',
          formlyConfig: {
            templateOptions: {
              remoteOptions: {
                type: 'vendors'
              }
            }
          }
        }
      }
    }
  };

  it('Transfer of the jsonschema form tag to the widget entry', () => {
    expect(formToWidget(schema, new LoggerService())).toEqual(schemaWidget);
  });
});
