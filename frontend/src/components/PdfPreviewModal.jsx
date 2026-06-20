import React from 'react';

const PdfPreviewModal = ({ isOpen, title, pdfUrl, onClose }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        const iframe = document.getElementById('pdf-preview-iframe');
        if (iframe) {
            iframe.contentWindow.print();
        }
    };

    const handleDownload = () => {
        window.open(pdfUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
                    <h2 className="text-lg font-semibold text-white">{title || 'Aperçu PDF'}</h2>
                    <div className="flex items-center space-x-3">
                        <button onClick={handlePrint} className="px-3 py-1.5 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] text-white rounded transition-colors text-sm flex items-center">
                            🖨️ Imprimer
                        </button>
                        <button onClick={handleDownload} className="px-3 py-1.5 bg-[var(--color-primary)] hover:bg-opacity-90 text-white rounded transition-colors text-sm flex items-center">
                            📥 Télécharger
                        </button>
                        <button onClick={onClose} className="p-1.5 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-error)]/20 rounded transition-colors ml-4">
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-gray-500 overflow-hidden rounded-b-lg">
                    {pdfUrl ? (
                        <iframe 
                            id="pdf-preview-iframe"
                            src={`${pdfUrl}#toolbar=0`} 
                            className="w-full h-full border-0"
                            title="Aperçu PDF"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white">Chargement...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PdfPreviewModal;
