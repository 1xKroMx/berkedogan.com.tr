import { getSql } from './db.js';

const QSTASH_URL = process.env.QSTASH_URL || "https://qstash.upstash.io/v2/publish";
const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const APP_URL = process.env.APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://berkedogan.com.tr";

/**
 * Calculates the next Unix timestamp for the given HH:mm time in Istanbul.
 * If time is 'TEST', schedules for 30 seconds from now.
 */
function getNextNotifyTimestamp(time, tasksDeadline) {
  if (!time) return null;
  
  // Test mode: schedule 30 seconds from now
  if (time === 'TEST') {
    return Math.floor(Date.now() / 1000) + 30;
  }
  
  const [hour, minute] = time.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute)) return null;
  
  // Create date in Istanbul time
  // Since JS Date is local or UTC, simple manipulation is tricky with timezone.
  // We'll use a simplified approach assuming the server environment (Vercel) time or relying on offsets.
  // Ideally, use a library like 'date-fns-tz' but we might not have it.
  // Let's assume we want to schedule it for the next occurrence.
  
  const now = new Date();
  // Adjust to Istanbul time (approximate if server is UTC)
  // Istanbul is UTC+3.
  const nowIstanbul = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  
  let target = new Date(nowIstanbul);
  target.setUTCHours(hour - 3, minute, 0, 0); // Convert back to UTC for the Date object
  
  if (target.getTime() <= now.getTime()) {
      // If time passed today, schedule for tomorrow
      target.setDate(target.getDate() + 1);
  }
  
  return Math.floor(target.getTime() / 1000);
}

export async function scheduleTaskNotification(task) {
  if (!QSTASH_TOKEN) return null;
  if (!task.notifyEnabled || !task.notifyTime) return null;

  // If a message ID exists, cancel it first (just to be safe/clean)
  if (task.qstashMessageId) {
    await cancelTaskNotification(task.qstashMessageId);
  }

  const notBefore = getNextNotifyTimestamp(task.notifyTime);
  if (!notBefore) return null;

  try {
    const destination = `${APP_URL}/api/push?action=trigger-task`;
    
    const res = await fetch(destination, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${QSTASH_TOKEN}`,
        "Upstash-Not-Before": String(notBefore),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        taskId: task.id
      })
    });
    
    // NOTE: QStash v2 publish endpoint is actually:
    // POST https://qstash.upstash.io/v2/publish/URL
    // The previous fetch was wrong.
    
    const res2 = await fetch(`${QSTASH_URL}/${destination}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${QSTASH_TOKEN}`,
            "Upstash-Not-Before": String(notBefore),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ taskId: task.id })
    });

    const data = await res2.json();
    
    if (data.messageId) {
       // Update DB with new messageId
       const sql = getSql();
       await sql`
         UPDATE tasks 
         SET "qstashMessageId" = ${data.messageId}
         WHERE id = ${task.id}
       `;
       return data.messageId;
    }
  } catch (e) {
    console.error("QStash Schedule Error", e);
  }
  return null;
}

export async function cancelTaskNotification(messageId) {
  if (!QSTASH_TOKEN || !messageId) return;

  try {
    // QStash delete endpoint: DELETE https://qstash.upstash.io/v2/messages/:messageId
    await fetch(`https://qstash.upstash.io/v2/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${QSTASH_TOKEN}`
      }
    });
  } catch (e) {
    console.error("QStash Cancel Error", e);
  }
}
