import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'co-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {
  @Input() label: string = "";
  @Input() value: boolean | undefined = false;
  @Input() disabled: boolean = false;
  @Output('valueChange') onValueChange = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit(): void {
  }

  handleOnClick() {
    if (this.disabled) return;

    this.value = !this.value;
    this.onValueChange.emit(this.value);
  }

}
