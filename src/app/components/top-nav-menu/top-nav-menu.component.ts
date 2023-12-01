import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IUser } from 'src/app/models/IUser';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-top-nav-menu',
  templateUrl: './top-nav-menu.component.html',
  styleUrls: ['./top-nav-menu.component.scss'],
  host: {
    '(document:click)': 'handleClickOutside($event)'
  }
})
export class TopNavMenuComponent implements OnInit {
  @ViewChild('profileMenu') profileMenu?: ElementRef;

  title: string = environment.webTitle;
  profileMenuOpened: boolean = false;
  users: Array<IUser> = [];
  selectedUser?: IUser = undefined;

  constructor(private readonly userService: UserService) {}

  async ngOnInit(): Promise<void> {
    this.users = await this.userService.list();
    this.selectedUser = this.users[0];
  }

   /* Listeners */
   handleClickOutside(event: any) {
    if (this.profileMenuOpened && !this.profileMenu?.nativeElement.contains(event.target)) {
      this.profileMenuOpened = false;
    }
  }

  onUserSelect(user: IUser): void {
    this.selectedUser = user;
    this.profileMenuOpened = false;
  }
}
