interface IFile {
    id: string;
    blobId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    originType: string;     // File Systen, Email, Portal
    origin: string;         // Computer, Email Address, Portal Name
    originalPath: string;   // File System Path, Email Path, Portal Path
    created: Date;
}

export default IFile;