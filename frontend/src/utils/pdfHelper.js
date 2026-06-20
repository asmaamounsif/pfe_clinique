import api from '../services/api';

/**
 * Downloads a PDF securely by attaching the JWT token via the Axios instance.
 * @param {string} url - The API endpoint returning the PDF
 * @param {string} fallbackFilename - Filename to use if content-disposition header is missing
 */
export const downloadPdf = async (url, fallbackFilename = 'document.pdf') => {
    try {
        const response = await api.get(url, {
            responseType: 'blob', // Important: tells axios to handle binary data
        });

        // Try to get filename from headers if backend sets it
        const disposition = response.headers['content-disposition'];
        let filename = fallbackFilename;
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        // Create a blob URL and force download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Failed to download PDF securely:', error);
        alert("Erreur lors du téléchargement du PDF. Veuillez réessayer.");
    }
};
