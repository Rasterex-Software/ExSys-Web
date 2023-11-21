import { Component } from '@angular/core';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  documents = [
    {
      document: "Floor plan A",
      title: "Normalprofil",
      status: "Completed",
      revisions: 2,
      dateUploaded: "01.12.2023"
    },
    {
      document: "Floor plan B",
      title: "Normalprofil",
      status: "In progress",
      revisions: 4,
      dateUploaded: "30.11.2023"
    }
  ];
}
