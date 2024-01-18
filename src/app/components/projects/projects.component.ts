import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IBasicDocument, IDocument, IDocumentVersion } from 'src/app/models/IDocument';
import { DocumentsService } from 'src/app/services/documents.service';
import { RxServerService } from 'src/app/services/rxserver.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  @ViewChild("documentUpload", {static: false}) documentUpload?: ElementRef<HTMLIFrameElement>;
  @ViewChild("versionUpload", {static: false}) versionUpload?: ElementRef<HTMLIFrameElement>;

  confirmDelete: boolean = false;

  constructor(
    private readonly documentsService: DocumentsService,
    private readonly rxServerService: RxServerService
  ) {}

  async ngOnInit(): Promise<void> {
    this.documents = await this.documentsService.list();
  }

  documents: Array<IDocument> = [];
  selectedDocuments: Array<IBasicDocument> = [];
  expandedDocument: IDocument | undefined = undefined;
  clickedDocument: IBasicDocument | undefined = undefined;
  clickedVersion: IBasicDocument | undefined = undefined;
  viewDocument: IBasicDocument | undefined = undefined;
  confirmDeleteMessage: string | undefined = undefined;
  mode: 'compare' | 'view' | 'print' | 'download' | undefined = undefined;

  onCheck(value: boolean, document: IBasicDocument | undefined): void {
    if (!document) return;

    document.selected = value;

    if (document.selected) {
      if (!document?.name) {
        document.name = this.expandedDocument?.name;
      }

      this.selectedDocuments.push(document);
    } else {
      this.selectedDocuments = this.selectedDocuments.filter(doc => doc.id !== document.id);
    }

    if (this.mode == 'compare' && this.selectedDocuments.length != 2) {
      this.mode = undefined;
    }
  }

  onCompareClick(): void {
    this.viewDocument = undefined;
    this.mode = 'compare';
  }

  onExpandClick(document: IDocument): void {
    if (document?.id == this.expandedDocument?.id) {
      this.expandedDocument = undefined;
    } else {
      this.expandedDocument = document;
    }
  }

  onAddDocumentClick(): void {
    this.documentUpload?.nativeElement.click();
  }

  async onDocumentUpload(event: any): Promise<void> {
    const file = event.target.files[0];
    await this.rxServerService.uploadFile(file);
    const document = await this.documentsService.create(file);
    this.documents = await this.documentsService.list();
  }

  async onDocumentVersionUpload(event: any): Promise<void> {
    const file = event.target.files[0];
    if (this.clickedDocument) {
      await this.rxServerService.uploadFile(file);
      const version = await this.documentsService.createVersion(this.clickedDocument.id, file);
      const document = this.documents.find(doc => doc.id == this.clickedDocument?.id);
      if (document) {
        document.versions = [version, ...(document.versions || [])];
      }
    }
  }

  async onDeleteDocumentClick(document: IDocument): Promise<void> {
    this.clickedDocument = document;
    this.confirmDeleteMessage = `Are you sure you want ti delete the ${document.name} file with all of its revisions?`;
    this.confirmDelete = true;
  }

  onUploadVersionClick(document: IDocument): void {
    this.clickedDocument = document;
    this.versionUpload?.nativeElement.click();
  }

  async onDeleteVersionClick(document: IDocument, version: IDocumentVersion): Promise<void> {
    this.clickedDocument = document;
    this.clickedVersion = version;
    this.confirmDeleteMessage = `Are you sure you want to delete the revision ${version.name}?`;
    this.confirmDelete = true;
  }

  onDocumentClick(document: IBasicDocument): void {
    this.viewDocument = document;
    this.mode = 'view';
  }

  onCloseCompare(): void {
    this.mode = undefined;

    this.selectedDocuments.forEach(selectedDocument => {
      if (selectedDocument.documentId) {
        const document = this.documents.find(doc => doc.id == selectedDocument.documentId);
        if (document) {
          const version = document.versions?.find(v => v.id == selectedDocument.id);
          if (version) {
            version.selected = false;
          }
        }
      } else {
        const document = this.documents.find(doc => doc.id == selectedDocument.id);
        if (document) {
          document.selected = false;
        }
      }
    });

    this.selectedDocuments = [];
  }

  onDocumentCreate(document: IDocument): void {
    this.documents.push(document);
    this.onCloseCompare();
  }

  onCloseView(): void {
    this.viewDocument = undefined;
    this.mode = undefined;
  }

  onConfirmDeleteClose(): void {
    this.confirmDelete = false;
    this.clickedVersion = undefined;
    this.clickedDocument = undefined;
    this.confirmDeleteMessage = undefined;
  }

  async onConfirmDeleteOk(): Promise<void> {
    if (this.clickedVersion) {
      await this.documentsService.deleteVersion(this.clickedVersion.id);
      (this.clickedDocument as IDocument).versions = (this.clickedDocument as IDocument).versions?.filter(ver => ver.id !== this.clickedVersion?.id);
    } else if (this.clickedDocument) {
      await this.documentsService.delete(this.clickedDocument.id);
      this.documents = this.documents.filter(doc => doc.id !== this.clickedDocument?.id);
    }

    this.onConfirmDeleteClose();
  }

  onPrintDocumentClick(document: IDocument): void {
    this.viewDocument = document;
    this.mode = 'print';
  }

  onDownloadDocumentClick(document: IDocument): void {
    this.viewDocument = document;
    this.mode = 'download';
  }
}
