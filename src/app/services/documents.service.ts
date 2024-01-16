import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { IDocument, IDocumentVersion } from '../models/IDocument';

@Injectable({
    providedIn: 'root'
})
export class DocumentsService {
    constructor(private readonly httpService: HttpService) {}

    public async list(): Promise<Array<IDocument>> {
        const result: any = await this.httpService.get('/documents');
        return result.data;
    }

    public async create(file: File | string): Promise<IDocument> {
        const fileName = file instanceof File ? file.name : file;
        const result: any = await this.httpService.post('/documents', {
            name: fileName,
            title: fileName.split('.')[0],
            status: "In progress",
        });
        return result;
    }

    public async delete(documentId: number): Promise<void> {
        await this.httpService.delete(`/documents/${documentId}`);
    }

    public async createVersion(documentId: number, file: File): Promise<IDocumentVersion> {
        const result: any = await this.httpService.post(`/documents/${documentId}/versions`, {
            name: file.name,
            description: "...",
        });
        return result;
    }

    public async deleteVersion(versionId: number): Promise<void> {
        await this.httpService.delete(`/documents/versions/${versionId}`);
    }
}