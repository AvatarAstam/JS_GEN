// hooks/useRealtime.js
import { useEffect } from 'react';
import { db } from '../lib/firebase';

export const useRealtime = (canvasRef, boardId) => {
  useEffect(() => {
    const unsubscribe = db.collection('boards').doc(boardId)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data && canvasRef.current) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          const image = new Image();
          image.src = data.canvas;
          image.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);
          };
        }
      });

    return () => unsubscribe();
  }, [canvasRef, boardId]);

  const syncCanvas = (context) => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    db.collection('boards').doc(boardId).set({ canvas: dataUrl });
  };

  return { syncCanvas };
};
        
