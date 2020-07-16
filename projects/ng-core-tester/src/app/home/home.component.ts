/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { Component } from '@angular/core';
import { ApiService, DialogService, RecordSearchService, TranslateLanguageService } from '@rero/ng-core';
import { ToastrService } from 'ngx-toastr';
import { DocumentComponent } from '../record/document/document.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  // Object containing API paths.
  apiData: any;

  // Contains the full translated language of a language code.
  testLanguageTranslation: string;

  // Configuration for resources.
  recordConfig: Array<any> = [
    {
      key: 'documents',
      label: 'Documents',
      component: DocumentComponent
      ,
      exportFormats: [
        {
          label: 'JSON',
          format: 'json'
        }
      ],
    },
    {
      key: 'organisations',
      label: 'Organisations',
      exportFormats: [
        {
          label: 'JSON',
          format: 'json'
        },
        {
          label: 'CSV',
          format: 'csv'
        }
      ],
    }
  ];

  // Menu links for demo.
  demoMenu: any = {
    entries: [
      {
        routerLink: '/',
        cssActiveClass: '',
        iconCssClass: 'fa fa-home'
      },
      {
        name: 'Sonar',
        href: 'http://sonar.ch',
        iconCssClass: 'fa fa-external-link'
      }, {
        name: 'Alert',
        iconCssClass: 'fa fa-exclamation-triangle'
      }, {
        name: 'Hidden'
      }
    ]
  };

  /**
   * Show spinner for 5 seconds
   */
  showSpinner() {
    this._spinner.show();

    setTimeout(() => {
      this._spinner.hide();
    }, 5000);
  }

  /**
   * Constructor.
   *
   * - Initializes API object paths.
   * - Stores translated language.
   * - Empties aggregations filters.
   *
   * @param _dialogService Dialog service.
   * @param _apiService API service.
   * @param _translateLanguageService Translate language service.
   * @param _toastrService Toastr service.
   * @param _recordSearchService Record search service.
   * @param _spinner Spinner service
   */
  constructor(
    private _dialogService: DialogService,
    private _apiService: ApiService,
    private _translateLanguageService: TranslateLanguageService,
    private _toastrService: ToastrService,
    private _recordSearchService: RecordSearchService,
    private _spinner: NgxSpinnerService
  ) {
    this.apiData = {
      relative: this._apiService.getEndpointByType('documents'),
      absolute: this._apiService.getEndpointByType('documents', true),
    };

    this.testLanguageTranslation = this._translateLanguageService.translate('fr', 'fr');

    // Initializes aggregations filters to launch the first search.
    this._recordSearchService.setAggregationsFilters([]);
  }

  /**
   * Show a confirmation dialog box.
   */
  showDialog() {
    const config = {
      ignoreBackdropClick: true,
      initialState: {
        title: 'Confirmation',
        body: 'Exit without saving changes?',
        confirmButton: true
      }
    };

    this._dialogService.show(config).subscribe((confirm: boolean) => {
      if (confirm) {
        console.log('Confirmed !');
      }
    });
  }

  /**
   * Simulates a search by only log infos.
   *
   * @param searchText String to search.
   */
  doSearch(searchText: string) {
    console.log(`You search for: ${searchText}`);
  }

  /**
   * Shows an alert message with toastr.
   */
  addAlert() {
    const type = (document.getElementById('alert-type')) as HTMLSelectElement;
    const message = (document.getElementById('alert-message')) as HTMLInputElement;
    switch (type.value) {
      // Checkbox controls
      case 'success':
        this._toastrService.success(message.value);
        break;
      case 'info':
        this._toastrService.info(message.value);
        break;
      case 'warning':
        this._toastrService.warning(message.value);
        break;
      case 'danger':
        this._toastrService.error(message.value);
        break;
    }
  }

  /**
   * Show a message when item menu is clicked.
   *
   * @param item Menu item.
   */
  clickLinkItemMenu(item: any) {
    this._toastrService.success(`menu ${item.name} clicked`);
  }

  /**
   * Whether a menu item is visible or not.
   *
   * @param itemMenu Menu item.
   * @return True if the menu is visible.
   */
  isItemMenuVisible(itemMenu: any) {
    if (itemMenu.name === 'Hidden') {
      return false;
    }
    return true;
  }
}
