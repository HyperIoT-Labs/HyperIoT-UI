import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  openFile(fileBase64: string, mimeType: string, window?: Window) {
    const decodedFile = atob(fileBase64);
    const array = new Uint8Array(decodedFile.length);
    for (let i = 0; i < decodedFile.length; i++) {
      array[i] = decodedFile.charCodeAt(i);
    }
    const fileBlob = new Blob([array], { type: mimeType });
    const fileUrl = URL.createObjectURL(fileBlob);
    
    if (window) {
      window.location.href = fileUrl;
    } else {
      window.open(fileUrl, '_blank');
    }
  }

  downloadFile(fileBase64: string, fileName: string, mimeType: string) {
    const decodedFile = atob(fileBase64);
    const array = new Uint8Array(decodedFile.length);
    for (let i = 0; i < decodedFile.length; i++) {
      array[i] = decodedFile.charCodeAt(i);
    }
    const fileBlob = new Blob([array], { type: mimeType });
    const fileUrl = URL.createObjectURL(fileBlob);

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(fileUrl);
  }
}
