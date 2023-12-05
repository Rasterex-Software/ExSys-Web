import { EventEmitter, TemplateRef } from "@angular/core";

export interface DropdownPanel {
  templateRef: TemplateRef<any> | undefined;
  readonly closed: EventEmitter<void>;
}
