// pages/api/saveBoard.js
import { firestore } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { boardId, boardData, userId } = req.body;

    try {
      await firestore.collection('boards').doc(boardId).set({
        ...boardData,
        userId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      res.status(200).json({ message: 'Board saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save board' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
// pages/api/loadBoard.js
import { firestore } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { boardId } = req.query;

    try {
      const boardDoc = await firestore.collection('boards').doc(boardId).get();
      if (boardDoc.exists) {
        res.status(200).json(boardDoc.data());
      } else {
        res.status(404).json({ error: 'Board not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to load board' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
    }


// components/Canvas.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Canvas = ({ boardId }) => {
  const { user } = useAuth();
  const [boardData, setBoardData] = useState(null);

  useEffect(() => {
    // Load board data when component mounts
    const loadBoard = async () => {
      try {
        const response = await axios.get(`/api/loadBoard?boardId=${boardId}`);
        setBoardData(response.data);
      } catch (error) {
        console.error('Failed to load board', error);
      }
    };

    loadBoard();
  }, [boardId]);

  const saveBoard = async () => {
    try {
      const boardData = {
        // ... your canvas data here
      };

      await axios.post('/api/saveBoard', {
        boardId,
        boardData,
        userId: user.uid,
      });
      alert('Board saved successfully');
    } catch (error) {
      console.error('Failed to save board', error);
      alert('Failed to save board');
    }
  };

  return (
    <div>
      {/* Your canvas rendering logic here */}
      <button onClick={saveBoard}>Save Board</button>
    </div>
  );
};

export default Canvas;

// components/Toolbar.js
import { useCanvasContext } from '../context/CanvasContext';

const Toolbar = () => {
  const { saveBoard } = useCanvasContext();

  return (
    <div>
      {/* Your existing toolbar buttons */}
      <button onClick={saveBoard}>Save</button>
    </div>
  );
};

export default Toolbar;

// pages/board/[boardId].js
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import { CanvasProvider } from '../../context/CanvasContext';
import Canvas from '../../components/Canvas';

const BoardPage = () => {
  const router = useRouter();
  const { boardId } = router.query;

  return (
    <ProtectedRoute>
      <CanvasProvider>
        <Canvas boardId={boardId} />
      </CanvasProvider>
    </ProtectedRoute>
  );
};

export default BoardPage;

// context/CanvasContext.js
import { firestore } from '../lib/firebase';
import { useAuth } from './AuthContext';

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

  return (
    <CanvasContext.Provider value={{ canvasState, setCanvasState, saveBoard, loadBoard }}>
      {children}
    </CanvasContext.Provider>
  );
};

