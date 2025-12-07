import prisma from '../_lib/db.js';
import { withAuth } from '../_lib/auth.js';

const VALID_CATEGORIES = ['daily', 'weekly', 'monthly'];
const VALID_STATUSES = ['pending', 'done'];

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const tasks = await prisma.task.findMany({
        orderBy: { created_at: 'desc' }
      });
      return res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    const { title, category, status, due_date, description } = req.body;

    // Validation
    if (!title || !category || !status) {
      return res.status(400).json({ success: false, error: 'Missing required fields: title, category, status' });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, error: 'Invalid category. Must be one of: daily, weekly, monthly' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Must be one of: pending, done' });
    }

    try {
      const newTask = await prisma.task.create({
        data: {
          title,
          category,
          status,
          due_date: due_date ? new Date(due_date) : null,
          description
        }
      });
      return res.status(201).json({ success: true, data: newTask });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}

export default withAuth(handler);
