import React, { useRef, useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useRealtime } from '../../hooks/useRealtime';
import Toolbar from './Toolbar';
import ShapeTool from './ShapeTool';
import TextTool from './TextTool';
import StickyNote from './StickyNote';
import ImageUploader from './ImageUploader';
import PageNavigator from './PageNavigator';
import StickyNoteItem from './StickyNoteItem';

const Canvas = ({ boardId }) => {
  const canvasRef = useRef(null);
  const { 
    startDrawing, draw, stopDrawing, clearCanvas, undo, redo, 
    setTool, setShape, addText, addStickyNote, updateStickyNotePosition, updateStickyNoteContent, addImage, updateImagePosition,
    pages, currentPage, addPage, deletePage, switchPage
  } = useCanvas(canvasRef);
  const { syncCanvas } = useRealtime(canvasRef, boardId);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    clearCanvas(context);
  }, [clearCanvas, currentPage]);

  const handleMouseUp = () => {
    stopDrawing();
    syncCanvas(canvasRef.current.getContext('2d'));
  };

  return (
    <div className="canvas-container">
      <Toolbar setTool={setTool} />
      <ShapeTool setShape={setShape} />
      <TextTool addText={addText} />
      <StickyNote addStickyNote={addStickyNote} />
      <ImageUploader addImage={addImage} />
      <PageNavigator 
        pages={pages} 
        currentPage={currentPage} 
        addPage={addPage} 
        deletePage={deletePage} 
        switchPage={switchPage} 
      />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={handleMouseUp}
        onMouseLeave={stopDrawing}
      ></canvas>
      {stickyNotes.map(note => (
        <StickyNoteItem 
          key={note.id} 
          note={note} 
          updatePosition={updateStickyNotePosition} 
          updateContent={updateStickyNoteContent} 
        />
      ))}
      {images.map(image => (
        <img 
          key={image.id} 
          src={image.src} 
          alt="uploaded"
          style={{ top: image.y, left: image.x, position: 'absolute', cursor: 'move' }}
          onMouseDown={(e) => startImageDrag(e, image.id)}
          onMouseMove={(e) => dragImage(e, image.id)}
          onMouseUp={stopImageDrag}
        />
      ))}
    </div>
  );
};

export default Canvas;
    
