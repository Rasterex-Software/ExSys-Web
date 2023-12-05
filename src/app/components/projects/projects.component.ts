import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IBasicDocument, IDocument, IDocumentVersion } from 'src/app/models/IDocument';
import { DocumentsService } from 'src/app/services/documents.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  @ViewChild("documentUpload", {static: false}) documentUpload?: ElementRef<HTMLIFrameElement>;
  @ViewChild("versionUpload", {static: false}) versionUpload?: ElementRef<HTMLIFrameElement>;

  constructor(
    private readonly documentsService: DocumentsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.documents = await this.documentsService.list();
  }

  documents: Array<IDocument> = [];
  selectedDocuments: Array<IBasicDocument> = [];
  isCompare: boolean = false;
  expandedDocument: IDocument | undefined = undefined;
  clickedDocument: IBasicDocument | undefined = undefined;

  onCheck(value: boolean, document: IBasicDocument): void {
    document.selected = value;

    if (document.selected) {
      if (!document?.name) {
        document.name = this.expandedDocument?.name;
      }

      this.selectedDocuments.push(document);
    } else {
      this.selectedDocuments = this.selectedDocuments.filter(doc => doc.key !== document.key);
    }

    if (this.isCompare && this.selectedDocuments.length != 2) {
      this.isCompare = false;
    }
  }

  onCompareClick(): void {
    this.isCompare = true;
  }

  onExpandClick(document: IDocument): void {
    if (document?.id == this.expandedDocument?.id) {
      this.expandedDocument = undefined;
    } else {
      this.expandedDocument = document;
    }

    this.isCompare = false;
  }

  onAddDocumentClick(): void {
    this.documentUpload?.nativeElement.click();
  }

  async onDocumentUpload(event: any): Promise<void> {
    const file = event.target.files[0];
    const document = await this.documentsService.create(file);
    this.documents = await this.documentsService.list();
  }

  async onDocumentVersionUpload(event: any): Promise<void> {
    const file = event.target.files[0];
    if (this.clickedDocument) {
      const version = await this.documentsService.createVersion(this.clickedDocument.id, file);
      const document = this.documents.find(doc => doc.id == this.clickedDocument?.id);
      if (document) {
        document.versions?.push(version);
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
}
