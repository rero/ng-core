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
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DialogService } from '../../dialog/dialog.service';
import { File as RecordFile } from '../record';
import { FilesService } from './files.service';

@Component({
  selector: 'ng-core-record-files',
  templateUrl: './files.component.html',
})
export class RecordFilesComponent implements OnInit {
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

  // PID of the record.
  @Input()
  pid: string;

  // Type of resource.
  @Input()
  type: string;

  // Reference on file input, used to reset value
  @ViewChild('file', { read: ElementRef, static: false })
  fileInput: ElementRef;

  @ViewChild('formModal', { static: false })
  formModalTemplate: TemplateRef<any>;

  /**
   * Constructor.
   *
   * @param _fileService FilesService.
   * @param _dialogService Dialog service.
   * @param _translateService Translate service.
   * @param _toastrService Toastr service.
   * @param _spinner Spinner service.
   * @param _modalService Modal service.
   */
  constructor(
    private _fileService: FilesService,
    private _dialogService: DialogService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _spinner: NgxSpinnerService,
    private _modalService: BsModalService
  ) {}

  /**
   * Component initialization.
   *
   * Retrieve files from record
   */
  ngOnInit() {
    this._spinner.show();

    // Retrieve files for record.
    this.getFiles$()
      .pipe(
        catchError(() => {
          this.hasError = true;
          return of([]);
        })
      )
      .subscribe(() => {
        this._spinner.hide();
      });
  }

  /**
   * Get list of files for the record.
   *
   * @returns An observable emitting the list of files.
   */
  getFiles$(): Observable<any> {
    return this._fileService.list(this.type, this.pid).pipe(
      tap((files) => {
        this.files = files.map((item: RecordFile) => {
          item.showInfo = false;
          item.showChildren = false;
          return item;
        });
      })
    );
  }

  /**
   * Delete a file.
   *
   * @param file File object to delete
   */
  delete(file: RecordFile) {
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
          this.getFiles$().subscribe(() => {
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
    this.formModalRef = this._modalService.show(this.formModalTemplate, { class: 'modal-lg' });
  }

  /**
   * Hide the modal.
   */
  hideForm() {
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
    this._spinner.show();

    // Iterate over FileList object to process each files.
    Array.from(this.filesToUpload).forEach((file) => {
      const reader = new FileReader();

      // This method is called when file is finished to read in client side.
      reader.onload = () => {
        // Update or create a new file
        const fileName = this.currentFile ? this.currentFile.key : this.fileKey;

        this._fileService
          .put(this.type, this.pid, fileName, file)
          .subscribe(() => {
            this.hideForm();

            this._toastrService.success(
              this._translateService.instant('File uploaded successfully.')
            );

            this.getFiles$().subscribe(() => {
              this._spinner.hide();
            });
          });
      };

      // Begin file read.
      reader.readAsBinaryString(file);
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
}
