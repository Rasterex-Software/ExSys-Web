import { Component, ViewChild, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from "@angular/platform-browser";
import { IDocument } from 'src/app/models/IDocument';

@Component({
  selector: 'app-compare-panel',
  templateUrl: './compare-panel.component.html',
  styleUrls: ['./compare-panel.component.scss']
})
export class ComparePanelComponent implements OnInit {
  webViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.webViewerUrl);
  @ViewChild("iframe", {static: false}) iframe?: ElementRef<HTMLIFrameElement>;
  @Input() backgroundDocument: IDocument | undefined;
  @Input() overlayDocument: IDocument | undefined;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  constructor(private readonly sanitizer: DomSanitizer) {}

  isLoading: boolean = true;
  isExpandView: boolean = true;

  ngOnInit(): void {
    window.addEventListener("message", (event) => {
      switch (event.data.type) {
        case "progressStart": {
          this.isLoading = true;
          break;
        }
        case "progressEnd": {
          this.isLoading = false;
          break;
        }
      }
    }, false);
  }

  async onIframeLoad(): Promise<void> {
    if (!this.backgroundDocument?.url || !this.overlayDocument?.url) return;

    this.isLoading = true;
    
    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "guiConfig",
      payload: {
        canFileOpen: false,
        disableSideNavMenu: true,
        disableTopNavMenu: true,
      }
    }, "*");

    const backgroundFile = await (await fetch(this.backgroundDocument.url)).blob();
    const overlayFile = await (await fetch(this.overlayDocument?.url)).blob();

    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "compare",
      payload: {
        backgroundFile: new File([backgroundFile], this.backgroundDocument.fileName || "unknown"),
        overlayFile: new File([overlayFile], this.overlayDocument.fileName || "unknown"),
      }
    }, "*");
  }

  onCloseClick(): void {
    this.onClose.emit();
  }
}
