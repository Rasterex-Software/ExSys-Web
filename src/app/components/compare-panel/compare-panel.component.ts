import { Component, ViewChild, ElementRef, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from "@angular/platform-browser";
import { IBasicDocument } from 'src/app/models/IDocument';

@Component({
  selector: 'app-compare-panel',
  templateUrl: './compare-panel.component.html',
  styleUrls: ['./compare-panel.component.scss']
})
export class ComparePanelComponent implements OnInit {
  webViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.rxWebViewerUrl);
  webViewerUrlQ = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.rxWebViewerUrl}?t=${Date.now()}`);

  @ViewChild("iframe", {static: false}) iframe?: ElementRef<HTMLIFrameElement>;
  @ViewChild("panel", {static: false}) panel?: ElementRef<HTMLDivElement>;
  @Input() backgroundDocument: IBasicDocument | undefined;
  @Input() overlayDocument: IBasicDocument | undefined;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  constructor(private readonly sanitizer: DomSanitizer) {}

  isProgress: boolean = true;
  isExpandedView: boolean = false;
  progressMessage: string = "It takes a few seconds to generate the comparison."
  isFullScreenView: boolean = false;

  comparison: any = undefined;
  activeFileIndex: number = 2;

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
        case "comparisonComplete": {
          this.comparison = event.data.payload;

          this.iframe?.nativeElement.contentWindow?.postMessage({
            type: "guiMode",
            payload: {
              mode: this.isExpandedView || this.isFullScreenView ? "compare" : "view"
            }
          }, "*");

          break;
        }
        case "activeFileChanged": {
          if (!this.isProgress) {
            this.activeFileIndex = event.data.payload.index;
          }
        }
      }
    }, false);
  }

  async onIframeLoad(): Promise<void> {
    if (!this.backgroundDocument?.name || !this.overlayDocument?.name) return;

    this.isProgress = true;

    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "guiConfig",
      payload: {
        canFileOpen: false,
        disableSideNavMenu: true,
        disableTopNavMenu: true,
      }
    }, "*");

    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "compare",
      payload: {
        backgroundFileName: this.backgroundDocument.name,
        overlayFileName: this.overlayDocument.name,
      }
    }, "*");
  }

  onCloseClick(): void {
    this.onClose.emit();
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
    if (!this.comparison) return;

    const comparison = { ...this.comparison };
    delete comparison.activeColor.label;
    delete comparison.otherColor.label;

    const url = `${environment.rxWebViewerUrl}?compare=${encodeURIComponent(JSON.stringify(comparison)) }`;
    window.open(url, '_new');
  }

  panelWidth = `${Math.round(0.5*document.body.offsetWidth)}px`;

  adjustingEvent = {
    isAdjusting: false,
    width: '',
  };

  startAdjusting(event: MouseEvent): void {
    this.adjustingEvent.isAdjusting = true;
  }

  @HostListener('document:pointermove', ['$event'])
  updatePanelWidth(event: MouseEvent) {
    event.stopPropagation();
    if (!this.adjustingEvent.isAdjusting) return;

    const newWidth = document.body.offsetWidth - event.clientX;

    if (newWidth <= 600) {
      this.panelWidth = `${605}px`;
      this.adjustingEvent.isAdjusting = false;
    } else {
      this.panelWidth = `${newWidth}px`;
      this.adjustingEvent.width = this.panelWidth;
    }
  }

  @HostListener('document:pointerup', ['$event'])
  stopAdjusting() {
    this.adjustingEvent.isAdjusting = false;
  }

  onFileClick(fileIndex: number): void {
    this.activeFileIndex = fileIndex;

    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "setActiveFileByIndex",
      payload: {
        fileIndex
      }
    }, "*");

    if (fileIndex == 2) {
      this.iframe?.nativeElement.contentWindow?.postMessage({
        type: "guiMode",
        payload: {
          mode: this.isExpandedView || this.isFullScreenView ? "compare" : "view"
        }
      }, "*");
    }
  }

  onExpandViewClick(): void {
    this.panelWidth = '100%';

    if (this.activeFileIndex == 2) {
      this.iframe?.nativeElement.contentWindow?.postMessage({
        type: "guiMode",
        payload: {
          mode: "compare"
        }
      }, "*");
    }

    this.isExpandedView = true;
  }

  onMinimizeViewClick(): void {
    this.panelWidth = this.adjustingEvent.width;

    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "guiMode",
      payload: {
        mode: "view"
      }
    }, "*");

    this.isExpandedView = false;
  }

  onFullScreenOpen(): void {
    if (this.activeFileIndex == 2) {
      this.iframe?.nativeElement.contentWindow?.postMessage({
        type: "guiMode",
        payload: {
          mode: "compare"
        }
      }, "*");
    }

    this.isFullScreenView = true;
  }

  onFullScreenClose(): void {
    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "guiMode",
      payload: {
        mode: "view"
      }
    }, "*");

    this.isFullScreenView = false;
  }
}
