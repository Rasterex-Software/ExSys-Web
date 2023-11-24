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

  isProgress: boolean = true;
  isExpandedView: boolean = false;
  progressMessage: string = "It takes a few seconds to generate the comparison."

  ngOnInit(): void {
    window.addEventListener("message", (event) => {
      switch (event.data.type) {
        case "progressStart": {
          this.progressMessage = event.data.message;
          this.isProgress = true;
          break;
        }
        case "progressEnd": {
          this.isProgress = false;
          break;
        }
      }
    }, false);
  }

  async onIframeLoad(): Promise<void> {
    if (!this.backgroundDocument?.url || !this.overlayDocument?.url) return;

    this.isProgress = true;

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

  onExpandViewClick(): void {
    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "guiMode",
      payload: {
        mode: "annotate"
      }
    }, "*");
    this.isExpandedView = true;
  }

  onMinimizeViewClick(): void {
    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "guiMode",
      payload: {
        mode: "view"
      }
    }, "*");
    this.isExpandedView = false;
  }

  onSavaAsPDFClick(): void {
    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "export",
      payload: {
        isPDF: true
      }
    }, "*");
  }

  onOpenInViewerClick(): void {
    window.open(environment.webViewerUrl, '_new');
  }
}
