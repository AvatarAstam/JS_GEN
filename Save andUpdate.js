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
