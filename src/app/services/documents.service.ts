import { Injectable } from '@angular/core';
import { IUser } from '../models/IUser';
import { HttpService } from './http.service';
import { IBasicDocument, IDocument, IDocumentVersion } from '../models/IDocument';

@Injectable({
    providedIn: 'root'
})
export class DocumentsService {
    constructor(private readonly httpService: HttpService) {}

    public async list(): Promise<Array<IDocument>> {
        const result: any = await this.httpService.get('/documents');
        return result.data;
    }

    public async create(file: File): Promise<IDocument> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('title', file.name.split('.')[0]);
        formData.append('status', "In progress");
        const result: any = await this.httpService.postFile('/documents', formData);
        return result;
    }

    public async delete(documentId: number): Promise<void> {
        await this.httpService.delete(`/documents/${documentId}`);
    }

    public async createVersion(documentId: number, file: File): Promise<IDocumentVersion> {
        const formData = new FormData();
        formData.append('file', file);
        const result: any = await this.httpService.postFile(`/documents/${documentId}/versions`, formData);
        return result;
    }

    public async deleteVersion(versionId: number): Promise<void> {
        await this.httpService.delete(`/documents/versions/${versionId}`);
    }
}