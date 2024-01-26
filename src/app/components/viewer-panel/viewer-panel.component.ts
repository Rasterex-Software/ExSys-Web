import { Component, ViewChild, ElementRef, OnInit, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from "@angular/platform-browser";
import { IBasicDocument, IDocumentVersion } from 'src/app/models/IDocument';
import { DocumentsService } from 'src/app/services/documents.service';

@Component({
  selector: 'app-viewer-panel',
  templateUrl: './viewer-panel.component.html',
  styleUrls: ['./viewer-panel.component.scss']
})
export class ViewerPanelComponent implements OnInit, OnChanges {
  webViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.rxWebViewerUrl);
  webViewerUrlQ = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.rxWebViewerUrl}?t=${Date.now()}`);

  @ViewChild("iframe", {static: false}) iframe?: ElementRef<HTMLIFrameElement>;
  @ViewChild("panel", {static: false}) panel?: ElementRef<HTMLDivElement>;
  @Input() backgroundDocument: IBasicDocument | undefined;
  @Input() overlayDocument: IBasicDocument | undefined;
  @Input() mode: 'compare' | 'view' | 'download' | 'print' = 'view';
  @Input() viewDocument: IBasicDocument | undefined;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  @Output() onVersionCreate: EventEmitter<IDocumentVersion> = new EventEmitter<IDocumentVersion>();

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly documentsService: DocumentsService) {}

  isProgress: boolean = true;
  isExpandedView: boolean = false;
  progressMessage: string = "";
  isFullScreenView: boolean = false;
  comparison: any = undefined;
  activeFileIndex: number = 2;
  comparisonMarkupChanged: boolean = false;
  unsavedChanges: boolean = false;
  compareSaveIsInProgress: boolean = false;

  ngOnInit(): void {
    window.addEventListener("message", async (event) => {
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
          break;
        }
        case "downloadEnd": {
          this.onClose.emit();
          break;
        }
        case "compareSaveComplete": {
          if (this.compareSaveIsInProgress) return;

          this.compareSaveIsInProgress = true;
          const outputName = event.data.payload;
          let documentId: number | undefined = undefined;
          if (this.backgroundDocument?.documentId === undefined) {
            documentId = this.backgroundDocument?.id;
          } else if (this.overlayDocument?.documentId === undefined) {
            documentId = this.overlayDocument?.id;
          } else {
            documentId = this.backgroundDocument?.documentId;
          }
          if (documentId != undefined) {
            const document = await this.documentsService.createVersion(documentId, outputName);
            this.onVersionCreate.emit(document);
            this.compareSaveIsInProgress = false;
          } else {
            console.warn('Something went wrong: can not define document id.');
          }
          break;
        }
        case "comparisonMarkupChanged": {
          if (this.mode == 'compare')
          {
            this.comparisonMarkupChanged = event.data.payload;
          }
          break;
        }
      }
    }, false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["viewDocument"] && !changes["viewDocument"].isFirstChange()) {
      this.onIframeLoad();
    }
    if (changes["mode"]) {
      switch(this.mode) {
        case "compare": {
          this.progressMessage = "It takes a few seconds to generate the comparison.";
          break;
        }
        case "download": {
          this.progressMessage = "It takes a few seconds to export the file.";
          break;
        }
        case "view":
        case "print": {
          this.progressMessage = "It takes a few seconds to open the file.";
          break;
        }
      }
    }
  }

  async onIframeLoad(): Promise<void> {
    if (this.mode == "compare" && (!this.backgroundDocument?.name || !this.overlayDocument?.name)) return;
    if (this.mode == "view" && !this.viewDocument?.name) return;

    this.isProgress = true;

    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "guiConfig",
      payload: {
        canFileOpen: false,
        disableSideNavMenu: true,
        disableTopNavMenu: true,
      }
    }, "*");

    switch (this.mode) {
      case 'view':
      case 'print':
      case 'download': {
        this.iframe?.nativeElement.contentWindow?.postMessage({
          type: this.mode,
          payload: {
            fileName: this.viewDocument?.name,
          }
        }, "*");
        break;
      }
      case 'compare': {
        this.iframe?.nativeElement.contentWindow?.postMessage({
          type: "compare",
          payload: {
            backgroundFileName: this.backgroundDocument?.name,
            overlayFileName: this.overlayDocument?.name,
            outputName: `Comparison of revision ${this.backgroundDocument?.version || '0'} and ${this.overlayDocument?.version || '0'}.pdf`
          }
        }, "*");
        break;
      }
    }
  }

  onCloseClick(): void {
    if (this.comparisonMarkupChanged) {
      this.unsavedChanges = true;
    } else {
      this.onClose.emit();
    }
  }

  async onSaveOptionSelect(option: any): Promise<void> {
    switch (option?.value) {
      case 0: {
        this.iframe?.nativeElement.contentWindow?.postMessage({
          type: "compareSave",
          payload: {
            outputName: `Comparison of revision ${this.backgroundDocument?.version || '0'} and ${this.overlayDocument?.version || '0'}.pdf`
          }
        }, "*");
        break;
      }
      case 1: {
        this.iframe?.nativeElement.contentWindow?.postMessage({
          type: "export",
          payload: {
            isPDF: true
          }
        }, "*");
        break;
      }
      case 2: {
        this.iframe?.nativeElement.contentWindow?.postMessage({
          type: "export",
          payload: {
            isPDF: true
          }
        }, "*");
        this.iframe?.nativeElement.contentWindow?.postMessage({
          type: "compareSave",
          payload: {
            outputName: `Comparison of revision ${this.backgroundDocument?.version || '0'} and ${this.overlayDocument?.version || '0'}.pdf`
          }
        }, "*");
        break;
      }
    }

    this.unsavedChanges = this.comparisonMarkupChanged = false;
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
    width: this.panelWidth,
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

    switch(this.mode) {
      case "compare": {
        if (this.activeFileIndex == 2) {
          this.iframe?.nativeElement.contentWindow?.postMessage({
            type: "guiMode",
            payload: {
              mode: "compare"
            }
          }, "*");
        }
        break;
      }
      case "view": {
        this.iframe?.nativeElement.contentWindow?.postMessage({
          type: "guiMode",
          payload: {
            mode: "view"
          }
        }, "*");
        break;
      }
    }

    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "zoomWidth"
    }, "*");

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

    this.iframe?.nativeElement.contentWindow?.postMessage({
      type: "zoomWidth"
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

  onDiscardUnsavedChanges(): void {
    this.onClose.emit();
  }

  onCancelUnsavedChanges(): void {
    this.unsavedChanges = false;
  }
}
