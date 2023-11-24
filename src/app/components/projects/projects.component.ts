import { Component } from '@angular/core';
import { IDocument } from 'src/app/models/IDocument';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  documents: Array<IDocument> = [
    {
      name: "Floor plan A",
      title: "Normalprofil",
      status: "Completed",
      revisions: 2,
      dateUploaded: "01.12.2023",
      url: "/assets/docexamples/version1.pdf",
      fileName: "version1.pdf",
      selected: false
    },
    {
      name: "Floor plan B",
      title: "Normalprofil",
      status: "In progress",
      revisions: 4,
      dateUploaded: "30.11.2023",
      url: "/assets/docexamples/version2.pdf",
      fileName: "version2.pdf",
      selected: false
    }
  ];

  selectedDocuments: Array<IDocument> = [...this.documents];
  isCompare: boolean = true;

  onCheck(value: boolean, document: IDocument): void {
    document.selected = value;
    this.selectedDocuments = this.documents.filter(doc => doc.selected);
    if (this.isCompare && this.selectedDocuments.length != 2) {
      this.isCompare = false;
    }
  }

  onCompareClick(): void {
    this.isCompare = true;
  }
}
