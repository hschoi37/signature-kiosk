import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Save } from 'lucide-react';
import './App.css';

const SignatureKiosk = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#D4AF37');
  const [currentPenType, setCurrentPenType] = useState('pen');
  const [currentStroke, setCurrentStroke] = useState(3);
  const [savedSignatures, setSavedSignatures] = useState([
    {
      id: 1,
      data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMCA0MEM0MCAyMCA4MCA2MCAyMCA0MEMxNjAgMjAgMTgwIDYwIDE4MCA0MCIgc3Ryb2tlPSIjRDRBRjM3IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
      timestamp: '2025. 03. 15. 오후 2:30'
    },
    {
      id: 2,
      data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjRDRBRjM3Ij5UWEM8L3RleHQ+PC9zdmc+',
      timestamp: '2025. 03. 15. 오후 3:15'
    }
  ]);

  const penTypes = [
    { id: 'pen', name: '펜', icon: '✒️' },
    { id: 'marker', name: '마커', icon: '🖍️' },
    { id: 'brush', name: '붓펜', icon: '🖌️' }
  ];

  const strokeSizes = [2, 4, 8, 12];
  const colors = ['#D4AF37', '#FFFFFF', '#DC2626', '#3B82F6'];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getEventPos(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    
    switch(currentPenType) {
      case 'marker':
        ctx.lineWidth = currentStroke * 1.5;
        ctx.globalAlpha = 0.8;
        ctx.lineCap = 'square';
        break;
      case 'brush':
        ctx.lineWidth = currentStroke * 1.2;
        ctx.globalAlpha = 0.9;
        ctx.lineCap = 'round';
        break;
      default:
        ctx.lineWidth = currentStroke;
        ctx.globalAlpha = 1;
        ctx.lineCap = 'round';
    }
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const pos = getEventPos(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let hasDrawing = false;
    
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 0) {
        hasDrawing = true;
        break;
      }
    }
    
    if (!hasDrawing) {
      alert('서명을 작성해 주세요!');
      return;
    }
    
    const dataURL = canvas.toDataURL('image/png', 1.0);
    
    const newSignature = {
      id: Date.now(),
      data: dataURL,
      timestamp: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/\./g, '. ').replace(/,/g, '')
    };
    
    setSavedSignatures(prev => [newSignature, ...prev.slice(0, 9)]);
    clearCanvas();
    
    alert('서명이 성공적으로 저장되었습니다!');
  };

  return (
    <div className="signature-kiosk">
      <div className="container">
        
        <div className="header">
          <h1 className="title">2025 SK LEE ART EXHIBITION</h1>
          <div className="divider"></div>
          <p className="subtitle">방문기록을 남겨주세요</p>
        </div>

        <div className="toolbar">
          <div className="tool-group">
            <span className="tool-label">펜 종류</span>
            {penTypes.map((pen) => (
              <button
                key={pen.id}
                onClick={() => setCurrentPenType(pen.id)}
                className={`pen-btn ${currentPenType === pen.id ? 'active' : ''}`}
              >
                <span className="pen-icon">{pen.icon}</span>
                {pen.name}
              </button>
            ))}
            
            <span className="tool-label">굵기</span>
            {strokeSizes.map((size) => (
              <button
                key={size}
                onClick={() => setCurrentStroke(size)}
                className={`stroke-btn ${currentStroke === size ? 'active' : ''}`}
              >
                <div 
                  className={`stroke-indicator ${currentStroke === size ? 'active-indicator' : ''}`}
                  style={{ 
                    width: `${Math.min(size + 2, 16)}px`, 
                    height: `${Math.min(size + 2, 16)}px` 
                  }}
                />
              </button>
            ))}
            
            <span className="tool-label">색상</span>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`color-btn ${currentColor === color ? 'active' : ''}`}
                style={{ 
                  backgroundColor: color,
                  boxShadow: currentColor === color ? `0 0 15px ${color}40` : 'none'
                }}
              />
            ))}
          </div>
        </div>

        <div className="canvas-section">
          <div className="canvas-label">
            <p>↓ 서명 입력 영역 ↓</p>
          </div>
          
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              className="signature-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            
            <div className="canvas-grid" />
            
            <div className="canvas-placeholder">
              <div>
                <p className="placeholder-main">여기에 서명해주세요</p>
                <p className="placeholder-sub">마우스나 손가락으로 그려보세요</p>
              </div>
            </div>
            
            <div className="canvas-border" />
          </div>
        </div>

        <div className="button-section">
          <button onClick={clearCanvas} className="clear-btn">
            <Trash2 style={{ width: '16px', height: '16px' }} />
            지우기
          </button>
          <button onClick={saveSignature} className="save-btn">
            <Save style={{ width: '16px', height: '16px' }} />
            서명 저장
          </button>
        </div>

        <div className="signatures-section">
          <h3 className="signatures-title">최근 방문자 서명</h3>
          <div className="signatures-list">
            {savedSignatures.slice(0, 4).map((signature) => (
              <div key={signature.id} className="signature-card">
                <div className="signature-image">
                  <img src={signature.data} alt="서명" />
                </div>
                <p className="signature-timestamp">{signature.timestamp}</p>
              </div>
            ))}
            
            {savedSignatures.length === 0 && (
              <div className="no-signatures">
                <p>아직 저장된 서명이 없습니다</p>
                <p>첫 번째 서명을 남겨보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return <SignatureKiosk />;
}

export default App;