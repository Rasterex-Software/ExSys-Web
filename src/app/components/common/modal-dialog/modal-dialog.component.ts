import { Component, OnInit, OnDestroy, Input, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'co-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss']
})
export class ModalDialogComponent implements OnInit, OnDestroy {
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  constructor(private element: ElementRef) { }

  ngOnInit(): void {
    document.body.appendChild(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.element.nativeElement.remove();
  }

  onCloseClick(): void {
    this.onClose.emit();
  }

}
