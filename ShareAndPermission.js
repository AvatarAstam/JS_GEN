// pages/api/addPermission.js
import { firestore } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { boardId, userId, accessLevel } = req.body;

    try {
      await firestore.collection('permissions').doc(`${boardId}_${userId}`).set({
        boardId,
        userId,
        accessLevel,
      });
      res.status(200).json({ message: 'Permission added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add permission' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// pages/api/getPermissions.js
import { firestore } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { boardId } = req.query;

    try {
      const permissionsSnapshot = await firestore.collection('permissions')
        .where('boardId', '==', boardId)
        .get();
      const permissions = permissionsSnapshot.docs.map(doc => doc.data());
      res.status(200).json(permissions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// pages/api/removePermission.js
import { firestore } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { boardId, userId } = req.body;

    try {
      await firestore.collection('permissions').doc(`${boardId}_${userId}`).delete();
      res.status(200).json({ message: 'Permission removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove permission' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
        }
// pages/board/[boardId]/sharing.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const Sharing = () => {
  const router = useRouter();
  const { boardId } = router.query;
  const [permissions, setPermissions] = useState([]);
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('view');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`/api/getPermissions?boardId=${boardId}`);
        setPermissions(response.data);
      } catch (error) {
        console.error('Failed to fetch permissions', error);
      }
    };

    if (boardId) {
      fetchPermissions();
    }
  }, [boardId]);

  const handleAddPermission = async () => {
    try {
      const response = await axios.post('/api/addPermission', {
        boardId,
        userId: email, // You may want to map email to userId
        accessLevel,
      });
      setPermissions([...permissions, { boardId, userId: email, accessLevel }]);
      setEmail('');
    } catch (error) {
      console.error('Failed to add permission', error);
    }
  };

  const handleRemovePermission = async (userId) => {
    try {
      await axios.post('/api/removePermission', {
        boardId,
        userId,
      });
      setPermissions(permissions.filter(p => p.userId !== userId));
    } catch (error) {
      console.error('Failed to remove permission', error);
    }
  };

  return (
    <div>
      <h1>Manage Sharing and Permissions</h1>
      <div>
        <input
          type="email"
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          value={accessLevel}
          onChange={(e) => setAccessLevel(e.target.value)}
        >
          <option value="view">View</option>
          <option value="edit">Edit</option>
        </select>
        <button onClick={handleAddPermission}>Add Permission</button>
      </div>
      <ul>
        {permissions.map((permission) => (
          <li key={permission.userId}>
            {permission.userId} - {permission.accessLevel}
            <button onClick={() => handleRemovePermission(permission.userId)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sharing;
    // middleware/withAuth.js
import { firestore } from '../lib/firebase';

const withAuth = (handler, requiredAccessLevel) => {
  return async (req, res) => {
    const { boardId, userId } = req.body;

    try {
      const permissionDoc = await firestore.collection('permissions').doc(`${boardId}_${userId}`).get();
      if (!permissionDoc.exists || permissionDoc.data().accessLevel !== requiredAccessLevel) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export default withAuth;
      // pages/api/saveBoard.js
import { firestore } from '../../lib/firebase';
import withAuth from '../../middleware/withAuth';

const handler = async (req, res) => {
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
};

export default withAuth(handler, 'edit');
