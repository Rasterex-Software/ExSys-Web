export interface IBasicDocument {
    id: number;
    url: string;
    key: string;
    createdDate?: Date;
    name?: string;
    selected?: boolean;
    version: number;
}

export interface IDocumentVersion extends IBasicDocument {
    description: string;
}

export interface IDocument extends IBasicDocument {
    title?: string;
    status?: string;
    versions?: Array<IDocumentVersion>;
}