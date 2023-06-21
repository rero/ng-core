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
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DialogService } from '../../dialog/dialog.service';
import { ActionStatus } from '../action-status';
import { orderedJsonSchema, removeEmptyValues } from '../editor/utils';
import { File as RecordFile } from '../record';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { FilesService } from './files.service';
@Component({
  selector: 'ng-core-record-files',
  templateUrl: './files.component.html',
})
export class RecordFilesComponent implements OnDestroy, OnInit {
  // Record PID.
  @Input()
  pid: string;

  // Type of resource.
  @Input()
  type: string;

  // List of files for the record.
  files: Array<RecordFile> = [];

  // Current managed file
  currentFile: RecordFile = null;

  // Files list to upload, currently limited to one, but can be multiple.
  filesToUpload: FileList = null;

  // Form modal reference.
  formModalRef: BsModalRef;

  // Wether API raise an error or not.
  hasError = false;

  // File key to add
  fileKey: string;

  // Record data
  record: any;

  // Object containing data to build the metadata editor.
  metadataForm: {
    fields: Array<any>;
    model: any;
    form: any;
  } = {
    fields: [],
    model: null,
    form: null,
  };

  // Fields not to display in metadata info.
  infoExcludedFields = [
    'key',
    'bucket',
    'checksum',
    'file_id',
    'size',
    'version_id'
  ];

  // Observable resolving if files metadata can be updated.
  canAdd: ActionStatus = { can: false, message: '' };

  // Configuration for record type.
  private _config: any;

  // Subscriptions to observables.
  private _subscriptions: Subscription = new Subscription();

  // Default max file size in Mb.
  private _defaultMaxSize = 500;

  // Reference on file input, used to reset value
  @ViewChild('file', { read: ElementRef })
  fileInput: ElementRef;

  @ViewChild('formModal')
  formModalTemplate: TemplateRef<any>;

  @ViewChild('metadataFormModal')
  metadataFormModalTemplate: TemplateRef<any>;

  /**
   * Constructor.
   *
   * @param _fileService FilesService.
   * @param _dialogService Dialog service.
   * @param _translateService Translate service.
   * @param _toastrService Toastr service.
   * @param _spinner Spinner service.
   * @param _modalService Modal service.
   * @param _recordService Record service.
   * @param _recordUiService Record UI service.
   * @param _formlyJsonschema JSON schema for formly.
   */
  constructor(
    private _fileService: FilesService,
    private _dialogService: DialogService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _spinner: NgxSpinnerService,
    private _modalService: BsModalService,
    private _recordService: RecordService,
    private _recordUiService: RecordUiService,
    private _formlyJsonschema: FormlyJsonschema
  ) {}

  /**
   * Component initialization.
   *
   * Retrieve files from record
   */
  ngOnInit() {
    // Load configuration
    this._config = this._recordUiService.getResourceConfig(this.type);

    // Configures properties that are not displayed in information.
    if (this._config.files.infoExcludedFields) {
      this.infoExcludedFields = this.infoExcludedFields.concat(
        this._config.files.infoExcludedFields
      );
    }

    this._spinner.show();

    // Load files
    this._getFiles$().subscribe(() => {
      this._spinner.hide();
    });

    // Load JSON schema and initialize form.
    this._recordService
      .getSchemaForm(this.type)
      .subscribe((jsonSchema: any) => {
        if (jsonSchema.schema.properties._files) {
          this.metadataForm.form = new UntypedFormGroup({});
          this.metadataForm.fields = [
            this._formlyJsonschema.toFieldConfig(
              orderedJsonSchema(jsonSchema.schema.properties._files.items),
              {
                map: (field: any, schema: any) => {
                  if (schema.form) {
                    // Hide expression
                    if (schema.form.hideExpression) {
                      field.hideExpression = schema.form.hideExpression;
                    }

                    // expression properties
                    if (schema.form.expressionProperties) {
                      field.expressionProperties =
                        schema.form.expressionProperties;
                    }
                  }
                  return field;
                },
              }
            ),
          ];
        }
      });

    // Process when modal is hidden
    this._subscriptions.add(
      this._modalService.onHide.subscribe((reason: string | any) => {
        this.hideForm();
      })
    );
  }

  /**
   * Component destruction
   *
   * Unsubscribe from all subscriptions.
   */
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  /**
   * Delete a file.
   *
   * @param file File object to delete
   */
  deleteFile(file: RecordFile) {
    this._dialogService
      .show({
        ignoreBackdropClick: true,
        initialState: {
          title: this._translateService.instant('Confirmation'),
          body: this._translateService.instant(
            'Do you really want to remove this file?'
          ),
          confirmButton: true,
          confirmTitleButton: this._translateService.instant('OK'),
          cancelTitleButton: this._translateService.instant('Cancel'),
        },
      })
      .pipe(
        switchMap((confirm: boolean) => {
          if (confirm === true) {
            this._spinner.hide();

            return this._fileService
              .delete(this.type, this.pid, file.key, file.version_id)
              .pipe(map(() => true));
          }
          return of(false);
        })
      )
      .subscribe((removed: boolean) => {
        if (removed === true) {
          this._getFiles$().subscribe(() => {
            this._spinner.hide();
            this._toastrService.success(
              this._translateService.instant('File removed successfully.')
            );
          });
        }
      });
  }

  /**
   * Determine if the file is displayed in the list, as children are hidden by
   * default.
   *
   * @param file Record file.
   * @returns true if file has to be displayed.
   */
  showItem(file: RecordFile): boolean {
    if (file.is_head === true) {
      return true;
    }

    const found = this.files.find((item: RecordFile) => {
      return (
        item.key === file.key &&
        item.is_head === true &&
        item.showChildren === true
      );
    });

    return found !== undefined;
  }

  /**
   * Determine if the file has old versions.
   *
   * @param file Record file.
   * @returns true if file has old version.
   */
  hasChildren(file: RecordFile): boolean {
    if (file.is_head === false) {
      return false;
    }

    const sameFiles = this.files.filter(
      (item: RecordFile) => item.key === file.key
    );

    return sameFiles.length > 1;
  }

  /**
   * Show form inside the modal.
   */
  showForm() {
    this.formModalRef = this._modalService.show(this.formModalTemplate);
  }

  /**
   * Hide the modal.
   */
  hideForm() {
    if (this.metadataForm.model) {
      this._getFiles$().subscribe(() => {
        this.metadataForm.model = null;
      });
    }
    this.formModalRef.hide();
  }

  /**
   * When file input is changed, new FileList is stored for preparing the upload.
   *
   * @param fileList List of file to upload.
   */
  handleFileInput(fileList: FileList) {
    this.filesToUpload = fileList;
    this.fileKey = this.filesToUpload[0].name;
  }

  /**
   * Upload files
   */
  upload() {
    // Iterate over FileList object to process each files.
    Array.from(this.filesToUpload).forEach((file) => {
      this._spinner.show();

      try {
        if (file.size > this._defaultMaxSize * 1000 * 1000) {
          throw new Error(`The maximum size for a file is ${this._defaultMaxSize}Mb, ${file.name} cannot be uploaded.`);
        }

        const reader = new FileReader();

        // This method is called when file is finished to read in client side.
        reader.onload = () => {
          // Update or create a new file
          const fileName = this.currentFile
            ? this.currentFile.key
            : this.fileKey;

          this._fileService
            .put(this.type, this.pid, fileName, file)
            .subscribe(() => {
              this.hideForm();

              this._toastrService.success(
                this._translateService.instant('File uploaded successfully.')
              );

              this._getFiles$().subscribe(() => {
                this._spinner.hide();
              });
            });
        };

        // Begin file read.
        reader.readAsBinaryString(file);
      } catch (error) {
        this._spinner.hide();
        this._toastrService.error(
          this._translateService.instant(error.message)
        );
      }
    });
  }

  /**
   * Store current file to manage and show upload form.
   *
   * @param file File object to manage, when adding a new file, this value is `null`.
   */
  manageFile(file: RecordFile) {
    this.currentFile = file;
    this.showForm();
    this.resetForm();
  }

  /**
   * Reset file input and list of files to upload.
   */
  resetForm() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.filesToUpload = null;
  }

  /**
   * Return the URL of the file.
   *
   * @param file File object.
   * @returns URL of the file.
   */
  getFileUrl(file: RecordFile): string {
    return this._fileService.getUrl(this.type, this.pid, file.key);
  }

  /**
   * Edition of metadata for the given file.
   *
   * @param file File object.
   * @returns void
   */
  editMetadataFile(file: RecordFile): void {
    if (!file.metadata) {
      return;
    }

    // Set the model
    this.metadataForm.model = file.metadata;

    // Show modal
    this.formModalRef = this._modalService.show(this.metadataFormModalTemplate);
  }

  /**
   * Save file's metadata.
   *
   * @returns void
   */
  saveMetadata(): void {
    // Check if form has errors
    this.metadataForm.form.updateValueAndValidity();

    // Show a message if form has errors.
    if (this.metadataForm.form.valid === false) {
      this._toastrService.error(
        this._translateService.instant('The form contains errors.')
      );
      return;
    }

    this._spinner.show();

    // Clean empty data
    this.record._files = removeEmptyValues(this.record._files);

    // Update record
    this._recordService
      .update(this.type, this.pid, this.record)
      .pipe(
        switchMap(() => {
          return this._getFiles$();
        })
      )
      .subscribe(() => {
        this._spinner.hide();
        this.hideForm();
        this._toastrService.success(
          this._translateService.instant(
            'Metadata have been saved successfully.'
          )
        );
      });
  }

  /**
   * Observable for loading record and files.
   *
   * @returns Observable emitting files
   */
  private _getFiles$(): Observable<any> {
    return this._recordService.getRecord(this.type, this.pid).pipe(
      switchMap((record: any) => {
        this.record = record.metadata;
        return this._fileService.list(this.type, this.pid);
      }),
      tap((files) => {
        files = files.map((item: RecordFile) => {
          // By default, show info about the file.
          item.showInfo = true;
          item.url = this.getFileUrl(item);

          // By default, hide other versions of the file.
          item.showChildren = false;

          // Store metadata (retrieved from record).
          item.metadata = this._getFilesMetadata(item.key);
          return item;
        });

        // If set in config, apply the function for filtering files.
        if (this._config.files && this._config.files.filterList) {
          files = files.filter(this._config.files.filterList);
        }

        // If set in config, apply the function for filtering files.
        if (this._config.files && this._config.files.orderList) {
          files.sort(this._config.files.orderList);
        }

        this.files = files;
       }),
       tap(() => {
          // Check if a file can be added.
          const canAdd$ = this._config.files.canAdd
            ? this._config.files.canAdd()
            : of({ can: false, message: '' });
          this._subscriptions.add(
            canAdd$.subscribe((result: ActionStatus) => this.canAdd = result)
          );
       }),
      catchError(() => {
        this.hasError = true;
        return of([]);
      })
    );
  }

  /**
   * Get files metadata corresponding to file key, stored in record.
   *
   * @param fileKey File key.
   * @returns Metadata object for the file.
   */
  private _getFilesMetadata(fileKey: string): any {
    if (!this.record._files) {
      return null;
    }

    // Get metadata stored in record.
    const metadata = this.record._files.filter(
      (item: any) => fileKey === item.key
    );

    return metadata.length > 0 ? metadata[0] : null;
  }
}
