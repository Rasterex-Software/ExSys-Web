import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-top-nav-menu',
  templateUrl: './top-nav-menu.component.html',
  styleUrls: ['./top-nav-menu.component.scss']
})
export class TopNavMenuComponent {

  title: string = environment.webTitle;
  userName: string = "Bill Builder";
  userInitials: string = "BB";
}
