import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SubSink } from 'subsink';

import { QuestionFormMode } from '@app/model/convs-mgr/conversations/assessments';
import { FileStorageService } from '@app/state/file';
import { MediaUploadType } from '../../model/media-upload-type.enum';


@Component({
  selector: 'app-question-bank-media-upload',
  templateUrl: './media-upload-modal.component.html',
  styleUrl: './media-upload-modal.component.scss',
})
export class MediaUploadModalComponent implements OnInit
{
  @Output() fileUploaded = new EventEmitter<File>();
  fileAccept: string;
  mediaType = MediaUploadType
  uploadProgress = 0;
  selectedFile: File;
  mediaSrc: File;
  isUploading: boolean;
  path: string;
  index: number; 
  assessmentFormGroup: FormGroup;
  formViewMode: QuestionFormMode

  private _sBS = new SubSink ();

  @ViewChild('mediaUpload') input: ElementRef<HTMLInputElement>;

  constructor(public dialogRef: MatDialogRef<MediaUploadModalComponent >,
               @Inject(MAT_DIALOG_DATA) public data: { fileType: MediaUploadType, 
                                                       assessmentFormGroup: FormGroup, 
                                                       index: number,
                                                       formViewMode: QuestionFormMode
                                                       }, 
                                                        
               private _uploadService: FileStorageService,          
  ) {
    this.assessmentFormGroup = this.data.assessmentFormGroup;
    this.index = data.index;
    this.fileAccept = data.fileType === this.mediaType.Image ? 'image/*' : 'video/*';
    this.formViewMode = data.formViewMode;
  }

  ngOnInit()
  {
    this.path = this.questionFormGroup.get('mediaPath')?.value 
  }

  get questionsList() {
    return this.assessmentFormGroup.get('questions') as FormArray;
  }

  get questionFormGroup() {
    return this.questionsList?.at(this.index) as FormGroup;
  }

  /** Track files when upload type is drag and drop */
  onDrop(event: DragEvent): void 
  {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /** Upload a file once the user selects it */
  handleFileSelection(file: File): void 
  {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = () => {
      this.path = reader.result as string;
      this.mediaSrc = this.selectedFile
      if(this.questionFormGroup){
        this.questionFormGroup.patchValue({ mediaSrc: this.mediaSrc });
      }
      
      this.uploadFile(this.selectedFile)
    };
  }
  /** Programmatically open the file explorer */
  openFileExplorer(accept: string): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept; // set the accepted file types
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleFileSelection(file);
      }
    });

    // Append to the body to trigger the click event
    document.body.appendChild(fileInput);
    fileInput.click();

    // Remove the input from the DOM after usage
    document.body.removeChild(fileInput);
  }

  /** Save selected file to Firebase */
  async uploadFile(file: File): Promise<void> 
  {
    this.isUploading = true;
    this.uploadProgress = 0;

    // Determine which form is being used (questionFormGroup or questionBankForm)
    const mediaName = file.name || this.selectedFile.name;

    const upload$ = await this._uploadService.uploadSingleFileAndPercentage(this.selectedFile, `assessmentMedia/${mediaName}`);

    this._sBS.sink = upload$.subscribe(({ progress, downloadURL, filePath }) => {
      this.uploadProgress = Math.round(progress);
      
      if (this.uploadProgress === 100 && downloadURL) {
        // Apply media source to the correct form
        this.questionFormGroup.patchValue({ mediaSrc: downloadURL, mediaPath: filePath });

        this.isUploading = false;
        this.dialogRef.close(downloadURL); // Close dialog with uploaded file path
      }
    });
  }

  
  onCancel(): void 
  {
    this.dialogRef.close();
  }
}

