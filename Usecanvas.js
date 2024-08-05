import { useState, useEffect } from 'react';

export const useCanvas = (canvasRef) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [tool, setTool] = useState('pen');
  const [shape, setShape] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [stickyNotes, setStickyNotes] = useState([]);
  const [images, setImages] = useState([]);
  const [pages, setPages] = useState([{ id: Date.now(), content: null }]);
  const [currentPage, setCurrentPage] = useState(0);

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

  const addStickyNote = (content) => {
    const newNote = {
      id: Date.now(),
      content,
      x: 50,
      y: 50,
    };
    setStickyNotes([...stickyNotes, newNote]);
  };

  const updateStickyNotePosition = (id, x, y) => {
    const updatedNotes = stickyNotes.map(note => 
      note.id === id ? { ...note, x, y } : note
    );
    setStickyNotes(updatedNotes);
  };

  const updateStickyNoteContent = (id, content) => {
    const updatedNotes = stickyNotes.map(note => 
      note.id === id ? { ...note, content } : note
    );
    setStickyNotes(updatedNotes);
  };

  const addImage = (imageSrc) => {
    const newImage = {
      id: Date.now(),
      src: imageSrc,
      x: 50,
      y: 50,
    };
    setImages([...images, newImage]);
  };

  const updateImagePosition = (id, x, y) => {
    const updatedImages = images.map(image => 
      image.id === id ? { ...image, x, y } : image
    );
    setImages(updatedImages);
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

  const addPage = () => {
    setPages([...pages, { id: Date.now(), content: null }]);
  };

  const deletePage = (index) => {
    if (pages.length === 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (index <= currentPage) {
      setCurrentPage((prevPage) => (prevPage === 0 ? 0 : prevPage - 1));
    }
  };

  const switchPage = (index) => {
    setCurrentPage(index);
  };

  return { 
    startDrawing, draw, stopDrawing, clearCanvas, undo, redo, 
    setTool, setShape, addText, addStickyNote, updateStickyNotePosition, updateStickyNoteContent, addImage, updateImagePosition,
    pages, currentPage, addPage, deletePage, switchPage
  };
};
                  
