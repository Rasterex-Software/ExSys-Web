import { Injectable } from '@angular/core';
import { IUser } from '../models/IUser';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private readonly httpService: HttpService) {}

    public async list(): Promise<Array<IUser>> {
        const result: any = await this.httpService.get('/users');
        return result.data.map((user: IUser) => {
            const words = user?.name?.split(' ');
            if (words?.length) {
                user.initials = `${words[0]?.substring(0, 1)}${words[1]?.substring(0, 1)}`;
            }
            return user;
        });
    }
}