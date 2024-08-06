// components/Toolbar.js
import React from 'react';
import { useCanvasContext } from '../context/CanvasContext';

const Toolbar = () => {
  const { saveBoard, exportAsImage, exportAsPDF } = useCanvasContext();

  const handleSave = () => {
    saveBoard(); // Ensure this is called with the correct boardId in the context
  };

  return (
    <div>
      {/* Your existing toolbar buttons */}
      <button onClick={handleSave}>Save</button>
      <button onClick={exportAsImage}>Export as Image</button>
      <button onClick={exportAsPDF}>Export as PDF</button>
    </div>
  );
};

export default Toolbar;




// context/CanvasContext.js
import React, { createContext, useContext, useState } from 'react';
import { firestore } from '../lib/firebase';
import { useAuth } from './AuthContext';
import jsPDF from 'jspdf';

const CanvasContext = createContext();

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }) => {
  const [canvasState, setCanvasState] = useState(null);
  const { user } = useAuth();

  const saveBoard = async (boardId) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const boardData = {
        ...canvasState,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await firestore.collection('boards').doc(boardId).set({
        boardData,
        userId: user.uid,
      }, { merge: true });

      console.log('Board saved successfully');
    } catch (error) {
      console.error('Failed to save board', error);
    }
  };

  const loadBoard = async (boardId) => {
    try {
      const boardDoc = await firestore.collection('boards').doc(boardId).get();
      if (boardDoc.exists) {
        setCanvasState(boardDoc.data().boardData);
        console.log('Board loaded successfully');
      } else {
        console.log('Board not found');
      }
    } catch (error) {
      console.error('Failed to load board', error);
    }
  };

  const exportAsImage = () => {
    const canvas = document.getElementById('canvas');
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'board.png';
    link.click();
  };

  const exportAsPDF = () => {
    const canvas = document.getElementById('canvas');
    const image = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape');
    pdf.addImage(image, 'PNG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
    pdf.save('board.pdf');
  };

  return (
    <CanvasContext.Provider value={{ canvasState, setCanvasState, saveBoard, loadBoard, exportAsImage, exportAsPDF }}>
      {children}
    </CanvasContext.Provider>
  );
};

// components/Canvas.js
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCanvasContext } from '../context/CanvasContext';

const Canvas = ({ boardId }) => {
  const { canvasState, setCanvasState, saveBoard, loadBoard } = useCanvasContext();
  const router = useRouter();

  useEffect(() => {
    if (boardId) {
      loadBoard(boardId);
    }
  }, [boardId, loadBoard]);

  const handleSave = () => {
    saveBoard(boardId);
  };

  return (
    <div>
      <canvas id="canvas">
        {/* Your canvas rendering logic here */}
      </canvas>
      <button onClick={handleSave}>Save Board</button>
      {/* Add logic to render canvasState */}
    </div>
  );
};

export default Canvas;
  

