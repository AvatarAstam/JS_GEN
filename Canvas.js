
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
  const { startDrawing, draw, stopDrawing, clearCanvas, undo, redo } = useCanvas(canvasRef);
  const { syncCanvas } = useRealtime(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    clearCanvas(context);
    syncCanvas(context);
  }, [clearCanvas, syncCanvas]);

  return (
    <div className="canvas-container">
      <Toolbar />
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
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext('2d');
    context.lineTo(offsetX, offsetY);
    context.stroke();
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

  return { startDrawing, draw, stopDrawing, clearCanvas, undo, redo };
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
                   
  
