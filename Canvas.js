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
  const { startDrawing, draw, stopDrawing, clearCanvas, undo, redo, setTool } = useCanvas(canvasRef);
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
      <ShapeTool />
      <TextTool />
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

  return { startDrawing, draw, stopDrawing, clearCanvas, undo, redo, setTool, setShape };
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

const Toolbar = () => {
  return (
    <div className="toolbar">
      <button>Pen</button>
      <button>Highlighter</button>
      <button>Eraser</button>
      <button>Shapes</button>
      <button>Text</button>
      <button>Sticky Note</button>
      <button>Image Upload</button>
      <button>Undo</button>
      <button>Redo</button>
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
import React from 'react';

const TextTool = () => {
  return (
    <div className="text-tool">
      <button>Add Text</button>
    </div>
  );
};

export default TextTool;

//Sticky Notes.js
import React from 'react';

const StickyNote = () => {
  return (
    <div className="sticky-note">
      <button>Add Sticky Note</button>
    </div>
  );
};

export default StickyNote;

//imageuploder.js
import React from 'react';

const ImageUploader = () => {
  return (
    <div className="image-uploader">
      <input type="file" accept="image/*" />
    </div>
  );
};

export default ImageUploader;

//PageNavigator.js
import React from 'react';

const PageNavigator = () => {
  return (
    <div className="page-navigator">
      <button>Previous</button>
      <button>Next</button>
    </div>
  );
};

export default PageNavigator;

