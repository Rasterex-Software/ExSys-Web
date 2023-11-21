import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  webViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.webViewerUrl);

  constructor(private readonly sanitizer: DomSanitizer) {}
}
