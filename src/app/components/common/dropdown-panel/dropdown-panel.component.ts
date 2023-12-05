import {
  Component,
  Output,
  TemplateRef,
  ViewChild,
  EventEmitter
} from "@angular/core";
import { DropdownPanel } from "./dropdown-panel";

@Component({
  selector: 'co-dropdown-panel',
  templateUrl: './dropdown-panel.component.html',
  styleUrls: ['./dropdown-panel.component.scss']
})
export class DropdownPanelComponent implements DropdownPanel {
  @ViewChild(TemplateRef) templateRef: TemplateRef<any> | undefined;
  @Output() closed = new EventEmitter<void>();

  constructor() {}
}
