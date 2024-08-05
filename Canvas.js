
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
  
