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

  constructor(
    private readonly documentsService: DocumentsService,
    private readonly rxServerService: RxServerService
  ) {}

  async ngOnInit(): Promise<void> {
    this.documents = await this.documentsService.list();
  }

  documents: Array<IDocument> = [];
  selectedDocuments: Array<IBasicDocument> = [];
  isCompare: boolean = false;
  expandedDocument: IDocument | undefined = undefined;
  clickedDocument: IBasicDocument | undefined = undefined;
  viewDocument: IBasicDocument | undefined = undefined;

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

    if (this.isCompare && this.selectedDocuments.length != 2) {
      this.isCompare = false;
    }
  }

  onCompareClick(): void {
    this.viewDocument = undefined;
    this.isCompare = true;
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
      const version = await this.documentsService.createVersion(this.clickedDocument.id, file);
      const document = this.documents.find(doc => doc.id == this.clickedDocument?.id);
      if (document) {
        document.versions = [version, ...(document.versions || [])];
      }
    }
  }

  async onDeleteDocumentClick(document: IDocument): Promise<void> {
    if (confirm("Are You sure?")) {
      await this.documentsService.delete(document.id);
      this.documents = this.documents.filter(doc => doc.id !== document.id);
    }
  }

  onUploadVersionClick(document: IDocument): void {
    this.clickedDocument = document;
    this.versionUpload?.nativeElement.click();
  }

  async onDeleteVersionClick(document: IDocument, version: IDocumentVersion): Promise<void> {
    if (confirm("Are You sure?")) {
      await this.documentsService.deleteVersion(version.id);
      document.versions = document.versions?.filter(ver => ver.id !== version.id);
    }
  }

  onDocumentClick(document: IBasicDocument): void {
    this.viewDocument = undefined;
    this.isCompare = false;
    this.viewDocument = document;
  }

  onCloseCompare(): void {
    this.isCompare = false;

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

  onCloseView(): void {
    this.viewDocument = undefined;
  }
}
