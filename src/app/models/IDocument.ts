export interface IBasicDocument {
    id: number;
    createdDate?: Date;
    name?: string;
    selected?: boolean;
    version: number;
    documentId?: number;
}

export interface IDocumentVersion extends IBasicDocument {
    description: string;
}

export interface IDocument extends IBasicDocument {
    title?: string;
    status?: string;
    versions?: Array<IDocumentVersion>;
}