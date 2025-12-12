import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import Button from './Button';
import './QuizCreatedModal.css';

export default function QuizCreatedModal({ isOpen, onClose, quizId, quizName }) {
  const [copied, setCopied] = useState(false);

  // URL que o jogador vai usar para entrar no quiz
  const quizUrl = `${window.location.origin}/join?quiz=${quizId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-quiz-${quizId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>🎉 Quiz Criado com Sucesso!</h2>
            <p className="modal-subtitle">"{quizName}"</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p className="modal-description">
            Compartilhe este link ou QR Code com os participantes para que eles possam entrar no quiz:
          </p>

          {/* Link do Quiz */}
          <div className="quiz-link-section">
            <label className="section-label">Link de Acesso:</label>
            <div className="link-input-group">
              <input 
                type="text" 
                value={quizUrl} 
                readOnly 
                className="link-input"
              />
              <button 
                className="copy-btn" 
                onClick={handleCopyLink}
                title="Copiar link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="qr-code-section">
            <label className="section-label">QR Code:</label>
            <div className="qr-code-container">
              <QRCodeSVG 
                id="qr-code-svg"
                value={quizUrl} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <button 
              className="download-qr-btn" 
              onClick={handleDownloadQR}
            >
              Baixar QR Code
            </button>
          </div>

          {/* Informações adicionais */}
          <div className="quiz-info-box">
            <p><strong>ID do Quiz:</strong> {quizId}</p>
            <p className="info-tip">
              💡 Os participantes podem acessar usando o link ou escaneando o QR Code com a câmera do celular.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button className="btn-secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button 
            className="btn-primary" 
            onClick={() => window.open(quizUrl, '_blank')}
          >
            <ExternalLink size={18} />
            Abrir Link
          </Button>
        </div>
      </div>
    </div>
  );
}