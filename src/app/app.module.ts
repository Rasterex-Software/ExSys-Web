import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TopNavMenuComponent } from './components/top-nav-menu/top-nav-menu.component';
import { SideNavMenuComponent } from './components/side-nav-menu/side-nav-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavMenuComponent,
    SideNavMenuComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
