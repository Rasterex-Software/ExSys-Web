export interface IDocument {
    name?: string,
    title?: string,
    fileName: string,
    url: string,
    status?: string,
    revisions?: Number,
    dateUploaded?: string,
    selected?: boolean;
}