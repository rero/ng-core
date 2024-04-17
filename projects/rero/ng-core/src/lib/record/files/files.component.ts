/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DialogService } from '../../dialog/dialog.service';
import { ActionStatus } from '../action-status';
import { Record, File as RecordFile } from '../record';
import { RecordUiService } from '../record-ui.service';
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

  // input text filter
  filterText = '';

  // card title
  @Input()
  title: string = 'Files';

  // List of files for the record.
  files: Array<RecordFile> = [];

  // filtered array of files
  filteredFiles = [];

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

  /**
   * Container record for files.
   *
   * It can be a resource record such as a document or
   * a specific record resource as used by rero-invenio-files.
   */
  parentRecord: Record = null;

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
  infoExcludedFields = ['key', 'bucket', 'checksum', 'file_id', 'size', 'version_id'];

  // Observable resolving if files metadata can be updated.
  canAdd: ActionStatus = { can: false, message: '' };

  // Configuration for record type.
  private config: any;

  // Subscriptions to observables.
  private subscriptions: Subscription = new Subscription();

  // Default max file size in Mb.
  private defaultMaxSize = 500;

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
   * @param fileService FilesService.
   * @param dialogService Dialog service.
   * @param translateService Translate service.
   * @param toastrService Toastr service.
   * @param spinner Spinner service.
   * @param modalService Modal service.
   * @param recordService Record service.
   * @param recordUiService Record UI service.
   * @param formlyJsonschema JSON schema for formly.
   */
  constructor(
    private fileService: FilesService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService,
    private recordUiService: RecordUiService
  ) {}

  /**
   * Component initialization.
   *
   * Retrieve files from record
   */
  ngOnInit() {
    // Load configuration
    this.config = this.recordUiService.getResourceConfig(this.type);

    // Configures properties that are not displayed in information.
    if (this.config.files.infoExcludedFields) {
      this.infoExcludedFields = this.infoExcludedFields.concat(this.config.files.infoExcludedFields);
    }

    this.spinner.show();

    // Load files
    this._getFiles$().subscribe(() => {
      this.spinner.hide();
    });

    this.fileService.getMetadataForm(this.type).subscribe((form) => {
      return (this.metadataForm = form);
    });

    // Process when modal is hidden
    this.subscriptions.add(
      this.modalService.onHide.subscribe((reason: string | any) => {
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
    this.subscriptions.unsubscribe();
  }

  /**
   * Delete a file.
   *
   * @param file File object to delete
   */
  deleteFile(file: RecordFile) {
    this.dialogService
      .show({
        ignoreBackdropClick: true,
        initialState: {
          title: this.translateService.instant('Confirmation'),
          body: this.translateService.instant('Do you really want to remove this file?'),
          confirmButton: true,
          confirmTitleButton: this.translateService.instant('OK'),
          cancelTitleButton: this.translateService.instant('Cancel'),
        },
      })
      .pipe(
        switchMap((confirm: boolean) => {
          if (confirm === true) {
            this.spinner.hide();
            return this.fileService.delete(this.type, this.pid, this.parentRecord, file).pipe(map(() => {
              this.resetFilter();
              return true;
            }));
          }
          return of(false);
        })
      )
      .subscribe((removed: boolean) => {
        if (removed === true) {
          this._getFiles$().subscribe(() => {
            this.spinner.hide();
            this.toastrService.success(this.translateService.instant('File removed successfully.'));
          });
        }
      });
  }

  resetFilter() {
    this.filterText = '';
    this.filteredFiles = this.files;
  }
    /**
   * Fired when the text to filter the items changes.
   *
   * @param $event - standard event
   */
    onTextChange($event): void {
      if (this.filterText.length > 0) {
        this.filteredFiles = this.files.filter((value) => value.label.includes(this.filterText));
      } else {
        this.filteredFiles = this.files;
      }
    }

  /**
   * Get the string used to display the search result number.
   * @param hits - list of hit results.
   * @returns observable of the string representation of the number of results.
   */
    getResultsText(): Observable<string> {
      const remoteTotal = this.files.filter(v => v.is_head == true).length;
      const totalFiltered = this.filteredFiles.filter(v => v.is_head == true).length;
      if (totalFiltered == this.files.length) {
        return this.translateService.stream('{{ total }} results', { remoteTotal });
      }
      return totalFiltered === 0
        ? this.translateService.stream('no result')
        : this.translateService.stream('{{ total }} results of {{ remoteTotal }}', {
            total: totalFiltered,
            remoteTotal: remoteTotal,
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
      return item.key === file.key && item.is_head === true && item.showChildren === true;
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

    const sameFiles = this.files.filter((item: RecordFile) => item.key === file.key);

    return sameFiles.length > 1;
  }

  /**
   * Show form inside the modal.
   */
  showForm() {
    this.formModalRef = this.modalService.show(this.formModalTemplate);
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
    Array.from(this.filesToUpload).forEach((fileStream) => {
      if (this.currentFile == null && this.files.some((file) => file.key === this.fileKey)) {
        this.toastrService.error(this.translateService.instant('A file with same name already exists.'));
        return;
      }
      if (fileStream.size > this.defaultMaxSize * 1000 * 1000) {
        this.toastrService.error(this.translateService.instant('Maximum Size exceeded.'));
        return;
      }

      this.spinner.show();
      try {
        const reader = new FileReader();

        // This method is called when file is finished to read in client side.
        reader.onload = () => {
          // Update or create a new file
          var obs: Observable<any>;
          if (this.currentFile) {
            // already exists thus update the existing file
            obs = this.fileService.update(this.type, this.pid, this.parentRecord, this.currentFile, fileStream);
          } else {
            if (this.parentRecord == null) {
              // create the parent record
              // should not happens when a document is used as parent record
              obs = this.fileService.createParentRecord(this.type, this.pid).pipe(
                map((record) => (this.parentRecord = record)),
                switchMap(() =>
                  this.fileService.create(this.type, this.pid, this.parentRecord, this.fileKey, fileStream)
                )
              );
            } else {
              // the parent record already exists create only the new file
              obs = this.fileService.create(this.type, this.pid, this.parentRecord, this.fileKey, fileStream);
            }
          }

          obs.subscribe(() => {
            this.hideForm();

            this.toastrService.success(this.translateService.instant('File uploaded successfully. The files uploaded here will be publicly available. Make sure that you are legally allowed to distribute a file before adding it to a document.'));

            this._getFiles$().subscribe(() => {
              this.resetFilter();
              this.spinner.hide();
            });
          });
        };

        // Begin file read.
        reader.readAsBinaryString(fileStream);
      } catch (error) {
        this.spinner.hide();
        this.toastrService.error(this.translateService.instant(error.message));
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
    return this.fileService.getUrl(this.type, this.pid, file);
  }

  /**
   * Edition of metadata for the given file.
   *
   * @param file File object.
   * @returns void
   */
  editMetadataFile(file: RecordFile): void {
    this.currentFile = file;
    if (!file.metadata) {
      return;
    }

    // Set the model
    this.metadataForm.model = file.metadata;

    // Show modal
    this.formModalRef = this.modalService.show(this.metadataFormModalTemplate);
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
      this.toastrService.error(this.translateService.instant('The form contains errors.'));
      return;
    }
    this.spinner.show();
    // Update the file metadata
    this.fileService
      .updateMetadata(this.type, this.pid, this.parentRecord, this.currentFile)
      .pipe(
        switchMap(() => {
          return this._getFiles$();
        })
      )
      .subscribe(() => {
        this.resetFilter();
        this.spinner.hide();
        this.hideForm();
        this.toastrService.success(this.translateService.instant('Metadata have been saved successfully.'));
      });
  }

  /**
   * Observable for loading record and files.
   *
   * @returns Observable emitting files
   */
  private _getFiles$(): Observable<any> {
    return this.fileService.getParentRecord(this.type, this.pid).pipe(
      map((record: Record) => (this.parentRecord = record)),
      switchMap(() => this.fileService.list(this.type, this.pid, this.parentRecord)),
      map((files) => {
        return files.map((item: RecordFile) => {
          // By default, show info about the file.
          item.showInfo = false;
          // download url
          item.url = this.getFileUrl(item);
          // By default, hide other versions of the file.
          item.showChildren = false;
          if (item?.label == null) {
            item.label = item?.metadata?.label? item.metadata.label :item.key;
          }
          return item;
        });
      }),
      map((files) => {
        // If set in config, apply the function for filtering files.
        if (this.config.files && this.config.files.filterList) {
          files = files.filter(this.config.files.filterList);
        }
        // If set in config, apply the function for filtering files.
        if (this.config.files && this.config.files.orderList) {
          files.sort(this.config.files.orderList);
        }
        this.files = files;
        this.filteredFiles = files;
      }),
      tap(() => {
        // Check if a file can be added.
        const canAdd$ = this.config.files.canAdd ? this.config.files.canAdd() : of({ can: false, message: '' });
        this.subscriptions.add(canAdd$.subscribe((result: ActionStatus) => (this.canAdd = result)));
      }),
      catchError(() => {
        this.hasError = true;
        return of([]);
      })
    );
  }
}
