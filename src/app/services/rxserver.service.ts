import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RxServerService {
    private readonly baseUrl: string = environment.rxServerUrl;
    private readonly uploadPath: string = "C:\\Rasterex\\Upload\\";

    constructor() {}

    public async uploadFile(file: File): Promise<any> {
        const path = `${this.baseUrl}/RxBinWeb/RxCSISAPI.dll?WebClientFileUpload&${this.uploadPath}&${file.name}&${file.lastModified}&${file.size}`;
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                    });
                }
            }, false);
            xhr.addEventListener("error", () => {
                reject({
                status: xhr.status,
                statusText: xhr.statusText
                });
            }, false);
            xhr.open("POST", path, true);
            xhr.send(file);
        });
    }
}