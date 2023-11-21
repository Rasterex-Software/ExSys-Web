import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TopNavMenuComponent } from './components/top-nav-menu/top-nav-menu.component';
import { SideNavMenuComponent } from './components/side-nav-menu/side-nav-menu.component';
import { AppRoutingModule } from './app-routing.module';
import { ProjectsComponent } from './components/projects/projects.component';
import { CheckboxComponent } from './components/common/checkbox/checkbox.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavMenuComponent,
    SideNavMenuComponent,
    ProjectsComponent,
    CheckboxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
