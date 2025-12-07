import prisma from '../../_lib/db.js';
import { withAuth } from '../../_lib/auth.js';

const VALID_CATEGORIES = ['daily', 'weekly', 'monthly'];
const VALID_STATUSES = ['pending', 'done'];

async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Task ID is required' });
  }

  if (req.method === 'PATCH') {
    const { title, category, status, due_date, description } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date) : null;

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ success: false, error: 'Invalid category' });
      }
      updateData.category = category;
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }
      updateData.status = status;
    }

    try {
      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData
      });
      return res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.task.delete({
        where: { id }
      });
      return res.status(200).json({ success: true, data: { message: 'Task deleted successfully' } });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}

export default withAuth(handler);
