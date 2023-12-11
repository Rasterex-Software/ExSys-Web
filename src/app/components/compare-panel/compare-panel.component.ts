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
  webViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.webViewerUrl);
  @ViewChild("iframe", {static: false}) iframe?: ElementRef<HTMLIFrameElement>;
  @ViewChild("panel", {static: false}) panel?: ElementRef<HTMLDivElement>;
  @Input() backgroundDocument: IBasicDocument | undefined;
  @Input() overlayDocument: IBasicDocument | undefined;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  constructor(private readonly sanitizer: DomSanitizer) {}

  isProgress: boolean = true;
  isExpandedView: boolean = false;
  progressMessage: string = "It takes a few seconds to generate the comparison."

  comparison: any = undefined;

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
        backgroundFile: new File([backgroundFile], this.backgroundDocument.key || "unknown"),
        overlayFile: new File([overlayFile], this.overlayDocument.key || "unknown"),
      }
    }, "*");
  }

  onCloseClick(): void {
    this.onClose.emit();
  }

  onExpandViewClick(): void {
    this.panelWidth = '100%';
    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "guiMode",
      payload: {
        mode: "compare"
      }
    }, "*");
    this.isExpandedView = true;
  }

  onMinimizeViewClick(): void {
    this.panelWidth = this.adjustingEvent.width;
    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "guiMode",
      payload: {
        mode: "compare"
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
    if (!this.comparison) return;

    const comparison = { ...this.comparison };
    delete comparison.activeColor.label;
    delete comparison.otherColor.label;

    const url = `${environment.webViewerUrl}?compare=${encodeURIComponent(JSON.stringify(comparison)) }`;
    window.open(url, '_new');
  }

  panelWidth = `${Math.round(0.5*document.body.offsetWidth)}px`;

  adjustingEvent = {
    isAdjusting: false,
    startingCursorX: 0,
    startingWidth: this.panel?.nativeElement.offsetWidth || 0,
    width: '',
  };

  startAdjusting(event: MouseEvent): void {
    this.adjustingEvent.isAdjusting = true;
    this.adjustingEvent.startingCursorX = event.clientX;
  }

  @HostListener('window:mousemove', ['$event'])
  updatePanelWidth(event: MouseEvent) {
    if (!this.adjustingEvent.isAdjusting) {
      return;
    }

    const cursorDeltaX = -event.clientX + this.adjustingEvent.startingCursorX;
    const newWidth = this.adjustingEvent.startingWidth + cursorDeltaX;

    if (newWidth <= 600) return;

    this.panelWidth = `${newWidth}px`;
    this.adjustingEvent.width = this.panelWidth;
  }

  @HostListener('window:mouseup')
  stopAdjusting() {
    this.adjustingEvent.isAdjusting = false;
    this.adjustingEvent.startingWidth = parseInt(this.panelWidth);
  }

  onFileClick(fileIndex: number): void {
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
          mode: "compare"
        }
      }, "*");
    }
  }
}
