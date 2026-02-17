import { getSql } from './db.js';

const QSTASH_URL_RAW = process.env.QSTASH_URL || "https://qstash.upstash.io/v2/publish";
const QSTASH_URL = QSTASH_URL_RAW.endsWith("/v2/publish")
  ? QSTASH_URL_RAW
  : `${QSTASH_URL_RAW.replace(/\/$/, "")}/v2/publish`;
const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
// Always use production URL for callbacks
const APP_URL = process.env.APP_URL || "https://www.berkedogan.com.tr";

const ISTANBUL_TZ = "Europe/Istanbul";

const getIstanbulDateParts = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ISTANBUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
};

const buildUtcDateFromIstanbulParts = (parts, hour, minute) => {
  // Istanbul is UTC+3 year-round.
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, hour - 3, minute, 0, 0));
};

/**
 * Calculates the next Unix timestamp for the given HH:mm time in Istanbul.
 * If a deadline exists, schedule exactly at that date/time.
 * If time is 'TEST', schedules for 30 seconds from now.
 */
function getNextNotifyTimestamp(time, task) {
  if (!time) return null;

  // Test mode: schedule 30 seconds from now
  if (time === "TEST") {
    return Math.floor(Date.now() / 1000) + 30;
  }

  const [hour, minute] = time.split(":").map(Number);
  if (isNaN(hour) || isNaN(minute)) return null;

  const now = new Date();

  const deadline = task?.deadline ? new Date(task.deadline) : null;
  if (deadline && !Number.isNaN(deadline.getTime())) {
    const parts = getIstanbulDateParts(deadline);
    let target = buildUtcDateFromIstanbulParts(parts, hour, minute);

    if (target.getTime() <= now.getTime()) {
      if (task?.isRecurring && task?.interval && task.interval > 0) {
        const intervalMs = task.interval * 24 * 60 * 60 * 1000;
        while (target.getTime() <= now.getTime()) {
          target = new Date(target.getTime() + intervalMs);
        }
      } else {
        return null;
      }
    }

    return Math.floor(target.getTime() / 1000);
  }

  // Fallback: next occurrence of time today/tomorrow in Istanbul.
  const nowIstanbul = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  let target = new Date(nowIstanbul);
  target.setUTCHours(hour - 3, minute, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return Math.floor(target.getTime() / 1000);
}

export async function scheduleTaskNotification(task) {
  console.log('[QStash] Attempting to schedule notification for task:', task.id, 'notifyTime:', task.notifyTime);
  
  if (!QSTASH_TOKEN) {
    console.error('[QStash] QSTASH_TOKEN is not set in environment variables');
    return null;
  }
  if (!task.notifyEnabled || !task.notifyTime) {
    console.log('[QStash] Task notifications disabled or no time set');
    return null;
  }

  // If a message ID exists, cancel it first (just to be safe/clean)
  if (task.qstashMessageId) {
    await cancelTaskNotification(task.qstashMessageId);
  }

  const notBefore = getNextNotifyTimestamp(task.notifyTime, task);
  if (!notBefore) {
    console.error('[QStash] Failed to calculate notification timestamp');
    return null;
  }
  
  console.log('[QStash] Scheduling for timestamp:', notBefore, 'which is', new Date(notBefore * 1000).toISOString());

  try {
    const destination = `${APP_URL}/api/push?action=trigger-task`;
    
    const publishUrl = `${QSTASH_URL}/${encodeURI(destination)}`;
    console.log('[QStash] Sending to QStash:', QSTASH_URL, 'destination:', destination, 'publishUrl:', publishUrl);
    
    // QStash v2 publish endpoint: POST https://qstash.upstash.io/v2/publish/{destination}
    const res = await fetch(publishUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${QSTASH_TOKEN}`,
            "Upstash-Not-Before": String(notBefore),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ taskId: task.id })
    });

    console.log('[QStash] Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[QStash] API Error:', res.status, errorText);
      return null;
    }

    const data = await res.json();
    console.log('[QStash] Response data:', data);
    
    if (data.messageId) {
       // Update DB with new messageId (if column exists)
       try {
         const sql = getSql();
         await sql`
           UPDATE tasks 
           SET "qstashMessageId" = ${data.messageId}
           WHERE id = ${task.id}
         `;
       } catch (e) {
         console.error('[QStash] Could not save qstashMessageId (column missing?)', e?.code || e?.message || e);
       }

       console.log('[QStash] Successfully scheduled with messageId:', data.messageId);
       return data.messageId;
    }
  } catch (e) {
    console.error("[QStash] Schedule Error:", e);
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
