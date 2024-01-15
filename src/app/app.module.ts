import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TopNavMenuComponent } from './components/top-nav-menu/top-nav-menu.component';
import { SideNavMenuComponent } from './components/side-nav-menu/side-nav-menu.component';
import { AppRoutingModule } from './app-routing.module';
import { ProjectsComponent } from './components/projects/projects.component';
import { CheckboxComponent } from './components/common/checkbox/checkbox.component';
import { ViewerPanelComponent } from './components/viewer-panel/viewer-panel.component';
import { SimpleProgressComponent } from './components/common/simple-progress/simple-progress.component';
import { HttpClientModule } from '@angular/common/http';
import { DropdownPanelComponent } from './components/common/dropdown-panel/dropdown-panel.component';
import { DropdownTriggerForDirective } from './components/common/dropdown-panel/dropdown-panel.directive';
import { ModalDialogComponent } from './components/common/modal-dialog/modal-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavMenuComponent,
    SideNavMenuComponent,
    ProjectsComponent,
    CheckboxComponent,
    ViewerPanelComponent,
    SimpleProgressComponent,
    DropdownPanelComponent,
    DropdownTriggerForDirective,
    ModalDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
