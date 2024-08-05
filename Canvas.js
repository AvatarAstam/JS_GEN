import React, { useRef, useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useRealtime } from '../../hooks/useRealtime';
import Toolbar from './Toolbar';
import ShapeTool from './ShapeTool';
import TextTool from './TextTool';
import StickyNote from './StickyNote';
import ImageUploader from './ImageUploader';
import PageNavigator from './PageNavigator';

const Canvas = () => {
  const canvasRef = useRef(null);
  const { startDrawing, draw, stopDrawing, clearCanvas, undo, redo, setTool, setShape, addText } = useCanvas(canvasRef);
  const { syncCanvas } = useRealtime(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    clearCanvas(context);
    syncCanvas(context);
  }, [clearCanvas, syncCanvas]);

  return (
    <div className="canvas-container">
      <Toolbar setTool={setTool} />
      <ShapeTool setShape={setShape} />
      <TextTool addText={addText} />
      <StickyNote />
      <ImageUploader />
      <PageNavigator />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      ></canvas>
    </div>
  );
};

export default Canvas;




//useCanvas.js
import { useState, useEffect } from 'react';

export const useCanvas = (canvasRef) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [tool, setTool] = useState('pen');
  const [shape, setShape] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, [canvasRef]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setStartPos({ x: offsetX, y: offsetY });
    setIsDrawing(true);
  };

  const drawShape = (context, startX, startY, endX, endY) => {
    context.beginPath();
    if (shape === 'rectangle') {
      context.rect(startX, startY, endX - startX, endY - startY);
    } else if (shape === 'circle') {
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      context.arc(startX, startY, radius, 0, 2 * Math.PI);
    } else if (shape === 'line') {
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
    } else if (shape === 'arrow') {
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      const headLength = 10; // length of head in pixels
      const angle = Math.atan2(endY - startY, endX - startX);
      context.moveTo(endX, endY);
      context.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
      context.moveTo(endX, endY);
      context.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
    }
    context.stroke();
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext('2d');
    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      if (tool === 'pen') {
        context.strokeStyle = 'black';
        context.lineWidth = 2;
      } else if (tool === 'highlighter') {
        context.strokeStyle = 'yellow';
        context.lineWidth = 10;
      } else if (tool === 'eraser') {
        context.strokeStyle = 'white';
        context.lineWidth = 20;
      }
      context.lineTo(offsetX, offsetY);
      context.stroke();
    } else if (tool === 'shape') {
      clearCanvas(context);
      const image = new Image();
      image.src = canvasHistory[historyStep];
      image.onload = () => {
        context.drawImage(image, 0, 0);
        drawShape(context, startPos.x, startPos.y, offsetX, offsetY);
      };
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    setIsDrawing(false);
    const newCanvasHistory = [...canvasHistory.slice(0, historyStep + 1), canvas.toDataURL()];
    setCanvasHistory(newCanvasHistory);
    setHistoryStep(newCanvasHistory.length - 1);
  };

  const addText = (text, fontSize, fontColor) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px Arial`;
    context.fillStyle = fontColor;
    const textX = canvas.width / 2;
    const textY = canvas.height / 2;
    context.fillText(text, textX, textY);
    const newCanvasHistory = [...canvasHistory.slice(0, historyStep + 1), canvas.toDataURL()];
    setCanvasHistory(newCanvasHistory);
    setHistoryStep(newCanvasHistory.length - 1);
  };

  const clearCanvas = (context) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  };

  const undo = () => {
    if (historyStep === 0) return;
    setHistoryStep(historyStep - 1);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = canvasHistory[historyStep - 1];
    image.onload = () => {
      clearCanvas(context);
      context.drawImage(image, 0, 0);
    };
  };

  const redo = () => {
    if (historyStep === canvasHistory.length - 1) return;
    setHistoryStep(historyStep + 1);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = canvasHistory[historyStep + 1];
    image.onload = () => {
      clearCanvas(context);
      context.drawImage(image, 0, 0);
    };
  };

  return { startDrawing, draw, stopDrawing, clearCanvas, undo, redo, setTool, setShape, addText };
};
      
                                                                     

//useRealtime.js
import { useEffect } from 'react';

export const useRealtime = (canvasRef) => {
  // Dummy function to simulate real-time sync
  const syncCanvas = (context) => {
    console.log('Syncing canvas...');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    syncCanvas(context);
  }, [canvasRef]);

  return { syncCanvas };
};
                   
//Toolbar.js
import React from 'react';

const Toolbar = ({ setTool }) => {
  return (
    <div className="toolbar">
      <button onClick={() => setTool('pen')}>Pen</button>
      <button onClick={() => setTool('highlighter')}>Highlighter</button>
      <button onClick={() => setTool('eraser')}>Eraser</button>
      <button onClick={() => setTool('shape')}>Shapes</button>
      <button onClick={() => setTool('text')}>Text</button>
      <button onClick={() => setTool('stickyNote')}>Sticky Note</button>
      <button onClick={() => setTool('imageUpload')}>Image Upload</button>
      <button onClick={() => setTool('undo')}>Undo</button>
      <button onClick={() => setTool('redo')}>Redo</button>
    </div>
  );
};

export default Toolbar;

//ShapeTool.js
import React from 'react';

const ShapeTool = ({ setShape }) => {
  return (
    <div className="shape-tool">
      <button onClick={() => setShape('rectangle')}>Rectangle</button>
      <button onClick={() => setShape('circle')}>Circle</button>
      <button onClick={() => setShape('line')}>Line</button>
      <button onClick={() => setShape('arrow')}>Arrow</button>
    </div>
  );
};

export default ShapeTool;



//TextTool.js
import React, { useState } from 'react';

const TextTool = ({ addText }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [fontColor, setFontColor] = useState('#000000');

  const handleAddText = () => {
    addText(text, fontSize, fontColor);
    setText('');
  };

  return (
    <div className="text-tool">
      <input 
        type="text" 
        placeholder="Enter text" 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Font size" 
        value={fontSize} 
        onChange={(e) => setFontSize(Number(e.target.value))} 
      />
      <input 
        type="color" 
        value={fontColor} 
        onChange={(e) => setFontColor(e.target.value)} 
      />
      <button onClick={handleAddText}>Add Text</button>
    </div>
  );
};

export default TextTool;


//Sticky Notes.js
import React, { useState } from 'react';

const StickyNote = ({ addStickyNote }) => {
  const [noteContent, setNoteContent] = useState('');

  const handleAddStickyNote = () => {
    addStickyNote(noteContent);
    setNoteContent('');
  };

  return (
    <div className="sticky-note-tool">
      <textarea 
        placeholder="Enter note" 
        value={noteContent} 
        onChange={(e) => setNoteContent(e.target.value)} 
      />
      <button onClick={handleAddStickyNote}>Add Note</button>
    </div>
  );
};

export default StickyNote;


//imageuploder.js
import React, { useState } from 'react';

const ImageUploader = ({ addImage }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = () => {
    if (selectedImage) {
      addImage(selectedImage);
      setSelectedImage(null);
    }
  };

  return (
    <div className="image-uploader">
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleAddImage} disabled={!selectedImage}>
        Add Image
      </button>
    </div>
  );
};

export default ImageUploader;


//PageNavigator.js
import React from 'react';

const PageNavigator = ({ pages, currentPage, addPage, deletePage, switchPage }) => {
  return (
    <div className="page-navigator">
      <button onClick={addPage}>Add Page</button>
      {pages.map((page, index) => (
        <div key={page.id} className={`page-item ${currentPage === index ? 'active' : ''}`}>
          <span onClick={() => switchPage(index)}>Page {index + 1}</span>
          <button onClick={() => deletePage(index)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default PageNavigator;

