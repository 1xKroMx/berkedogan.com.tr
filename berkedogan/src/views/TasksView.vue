<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Task {
  id: number
  title: string
  completed: boolean
    completedAt?: string | null
  isRecurring?: boolean
  interval?: number
    deadline?: string | null
    deadlineDate?: string // helper for edit form
    notifyEnabled?: boolean
    notifyTime?: string | null
}

const tasks = ref<Task[]>([])
const isLoading = ref(false)

const nowMs = ref(Date.now())
let nowTimer: number | undefined

const WINDOW_24H_MS = 24 * 60 * 60 * 1000

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

type Rgb = { r: number; g: number; b: number }

const baseTextRgb = ref<Rgb | null>(null)
const DANGER_RED: Rgb = { r: 220, g: 53, b: 69 }

const parseCssColorToRgb = (input: string): Rgb | null => {
    const value = input.trim()
    if (!value) return null

    if (value.startsWith('#')) {
        const hex = value.slice(1)
        const isShort = hex.length === 3
        const isLong = hex.length === 6
        if (!isShort && !isLong) return null

        const r = parseInt(isShort ? hex[0] + hex[0] : hex.slice(0, 2), 16)
        const g = parseInt(isShort ? hex[1] + hex[1] : hex.slice(2, 4), 16)
        const b = parseInt(isShort ? hex[2] + hex[2] : hex.slice(4, 6), 16)
        if ([r, g, b].some((n) => Number.isNaN(n))) return null
        return { r, g, b }
    }

    const rgbMatch = value.match(/rgba?\(([^)]+)\)/i)
    if (rgbMatch) {
        const parts = rgbMatch[1].split(',').map((p) => Number(p.trim()))
        if (parts.length < 3) return null
        const [r, g, b] = parts
        if ([r, g, b].some((n) => !Number.isFinite(n))) return null
        return { r, g, b }
    }

    return null
}

const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => {
    const tt = clamp01(t)
    return {
        r: Math.round(a.r + (b.r - a.r) * tt),
        g: Math.round(a.g + (b.g - a.g) * tt),
        b: Math.round(a.b + (b.b - a.b) * tt),
    }
}

const getDeadlineMs = (task: Task) => {
    if (!task.deadline) return null
    const ms = new Date(task.deadline).getTime()
    return Number.isFinite(ms) ? ms : null
}

const getCompletedAtMs = (task: Task) => {
    if (!task.completedAt) return null
    const ms = new Date(task.completedAt).getTime()
    return Number.isFinite(ms) ? ms : null
}

const isOverdueIncomplete = (task: Task) => {
    if (task.completed) return false
    const deadlineMs = getDeadlineMs(task)
    if (deadlineMs == null) return false
    return nowMs.value > deadlineMs
}

const overdueIncompleteRedAlpha = (task: Task) => {
    if (!isOverdueIncomplete(task)) return null
    const deadlineMs = getDeadlineMs(task)
    if (deadlineMs == null) return null

    const elapsed = nowMs.value - deadlineMs
    const ratio = clamp01(elapsed / WINDOW_24H_MS)
    // More visible ramp: starts noticeably red and gets clearly red by the end.
    const eased = Math.sqrt(ratio)
    const minMix = 0.12
    const maxMix = 0.6
    return minMix + (maxMix - minMix) * eased
}

const overdueTextStyle = (task: Task) => {
    const mix = overdueIncompleteRedAlpha(task)
    if (mix == null) return undefined

    const base = baseTextRgb.value
    if (!base) return undefined

    const blended = mixRgb(base, DANGER_RED, mix)
    // Only text should be affected (not icons/background).
    return { color: `rgb(${blended.r}, ${blended.g}, ${blended.b})` }
}

const isExpiredInvisibleClientSide = (task: Task) => {
    if (task.completed) {
        const completedAtMs = getCompletedAtMs(task)
        if (completedAtMs != null) return nowMs.value - completedAtMs >= WINDOW_24H_MS

        // Backward-compat: if we don't have completedAt yet, fall back to deadline.
        const deadlineMs = getDeadlineMs(task)
        if (deadlineMs == null) return false
        return nowMs.value - deadlineMs >= WINDOW_24H_MS
    }

    const deadlineMs = getDeadlineMs(task)
    if (deadlineMs == null) return false
    return nowMs.value - deadlineMs >= WINDOW_24H_MS
}

const taskOpacity = (task: Task) => {
    if (!task.completed) return 1
    const completedAtMs = getCompletedAtMs(task)
    const startMs = completedAtMs ?? getDeadlineMs(task)
    if (startMs == null) return 1

    const elapsed = nowMs.value - startMs
    if (elapsed <= 0) return 1

    const ratio = clamp01(elapsed / WINDOW_24H_MS)
    const eased = Math.sqrt(ratio)
    return Math.max(0, 1 - eased)
}

const sortedTasks = computed<Task[]>(() => {
    const visibleTasks = tasks.value.filter((task) => !isExpiredInvisibleClientSide(task))

    return [...visibleTasks].sort((a, b) => {
    const statusDiff = Number(a.completed) - Number(b.completed)
    if (statusDiff !== 0) return statusDiff

    const timeA = a.deadline
      ? new Date(a.deadline).getTime()
      : Infinity

    const timeB = b.deadline
      ? new Date(b.deadline).getTime()
      : Infinity

    return timeA - timeB
  })
})



// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Form data
const newTaskTitle = ref('')
const newTaskInterval = ref<number | null>(null)
const newTaskIsRecurring = ref(false)
const newTaskDeadlineDate = ref<string>('') // For date picker

const newTaskNotifyEnabled = ref(false)
const newTaskNotifyTime = ref<string>('09:00')

const NOTIFY_OFF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#666666"><path d="M160-200v-60h80v-304q0-84 49.5-150.5T420-798v-22q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v22q81 17 130.5 83.5T720-564v304h80v60H160Zm320-302Zm0 422q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM300-260h360v-304q0-75-52.5-127.5T480-744q-75 0-127.5 52.5T300-564v304Z"/></svg>`
const NOTIFY_ON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#666666"><path d="M120-566q0-90 40-165t107-125l36 48q-56 42-89.5 104.5T180-566h-60Zm660 0q0-75-33.5-137.5T657-808l36-48q67 50 107 125t40 165h-60ZM160-200v-60h80v-304q0-84 49.5-150.5T420-798v-22q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v22q81 17 130.5 83.5T720-564v304h80v60H160Zm320-302Zm0 422q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM300-260h360v-304q0-75-52.5-127.5T480-744q-75 0-127.5 52.5T300-564v304Z"/></svg>`

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

const ensurePushSubscription = async () => {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker desteklenmiyor')
    }

    const reg = await navigator.serviceWorker.register('/sw.js')
    const ready = await navigator.serviceWorker.ready

    const keyRes = await fetch('/api/push/key', {
        credentials: 'include',
    })
    const keyData = await keyRes.json()
    if (!keyData?.success || !keyData?.key) {
        throw new Error('VAPID public key alınamadı')
    }

    let sub = await ready.pushManager.getSubscription()
    if (!sub) {
        sub = await ready.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(keyData.key),
        })
    }

    await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: sub }),
    })

    return reg
}

const toggleNewTaskNotifications = async () => {
    if (newTaskNotifyEnabled.value) {
        newTaskNotifyEnabled.value = false
        return
    }

    if (!('Notification' in window)) {
        alert('Tarayıcı bildirimleri desteklemiyor.')
        newTaskNotifyEnabled.value = false
        return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
        alert('Bildirim izni verilmedi. Bildirimler aktif edilemez.')
        newTaskNotifyEnabled.value = false
        return
    }

    try {
        await ensurePushSubscription()
        newTaskNotifyEnabled.value = true
    } catch (e) {
        console.error('Push subscription error', e)
        alert('Bildirim kurulumu başarısız oldu.')
        newTaskNotifyEnabled.value = false
    }
}

const editingTask = ref<Task | null>(null)
const taskToDelete = ref<Task | null>(null)

const fetchTasks = async () => {
    isLoading.value = true
    try {
        const res = await fetch("/api/tasks", {
            credentials: "include"
        })
        const data = await res.json()
        if (data.success) {
            tasks.value = data.tasks
        } else {
            console.error("API Error:", data.error)
        }
    } catch (err) {
        console.error("Fetch Error:", err)
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
        const rootStyle = getComputedStyle(document.documentElement)
        const cssVar = rootStyle.getPropertyValue('--color-text-primary').trim()
        baseTextRgb.value = parseCssColorToRgb(cssVar) || parseCssColorToRgb(getComputedStyle(document.body).color)

    nowTimer = window.setInterval(() => {
      nowMs.value = Date.now()
    }, 60 * 1000)

    try {
        await fetch("/api/tasks/reset", {
            method: "POST",
            credentials: "include"
        })
    } catch (e) {
        console.error("Reset check failed", e)
    }
    await fetchTasks()
})

onUnmounted(() => {
    if (nowTimer) window.clearInterval(nowTimer)
})

const highlightCompletedUntilMsById = ref<Record<number, number>>({})

const isHighlightedCompletion = (task: Task) => {
    const until = highlightCompletedUntilMsById.value[task.id]
    return Boolean(until && Date.now() < until)
}

const toggleTask = async (task: Task) => {
    const deadlineMs = getDeadlineMs(task)
    const wasOverdueIncomplete = !task.completed && deadlineMs != null && Date.now() > deadlineMs
    const wasInOverdueWindow = wasOverdueIncomplete && (Date.now() - deadlineMs!) < WINDOW_24H_MS

    const previousCompleted = task.completed
    const previousCompletedAt = task.completedAt
    const isCompleting = !task.completed

    // Optimistic UI update: don't wait for network.
    task.completed = isCompleting
    task.completedAt = isCompleting ? new Date().toISOString() : null

    if (isCompleting && wasInOverdueWindow) {
        highlightCompletedUntilMsById.value = {
          ...highlightCompletedUntilMsById.value,
          [task.id]: Date.now() + 900,
        }
    }

    try {
        const res = await fetch("/api/tasks/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ id: task.id })
        })
        const data = await res.json()
        if (data.success) {
            // Update local state
            const index = tasks.value.findIndex(t => t.id === task.id)
            if (index !== -1) {
                tasks.value[index] = data.task
            }
        } else {
            // If failed
            task.completed = previousCompleted
            task.completedAt = previousCompletedAt
            console.error("Toggle Error:", data.error)
        }
    } catch (err) {
        task.completed = previousCompleted
        task.completedAt = previousCompletedAt
        console.error("Toggle Error:", err)
    }
}

const openAddModal = () => {
    newTaskTitle.value = ''
    newTaskInterval.value = null
    newTaskIsRecurring.value = false
    newTaskNotifyEnabled.value = false
    newTaskNotifyTime.value = '09:00'
    
    // Set default date to tomorrow for date picker usage
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    newTaskDeadlineDate.value = tomorrow.toISOString().split('T')[0]
    
    showAddModal.value = true
}

const addTask = async () => {
    // If NOT recurring and notify IS enabled, Ensure we have a date
    if (!newTaskIsRecurring.value && newTaskNotifyEnabled.value && !newTaskDeadlineDate.value) {
        alert("Lütfen bir tarih seçin.")
        return
    }

    // Required fields check: Title is always required.
    // If it is Recurring, Interval is required.
    // If it is NOT Recurring, either Interval OR DeadlineDate is required.
    if (!newTaskTitle.value.trim()) {
         alert("Please enter a title.")
         return
    }
    
    if (newTaskIsRecurring.value && (!newTaskInterval.value || newTaskInterval.value <= 0)) {
        alert("Recurring tasks require a valid interval (days).")
        return
    }
    
    if (!newTaskIsRecurring.value && !newTaskNotifyEnabled.value && (!newTaskInterval.value || newTaskInterval.value <= 0)) {
         alert("Please enter a duration.")
         return
    }

    if (newTaskNotifyEnabled.value && !newTaskNotifyTime.value) {
        alert('Lütfen bildirim saati seçin.')
        return
    }
    
    try {
        const res = await fetch("/api/tasks/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ 
                title: newTaskTitle.value,
                interval: newTaskInterval.value,
                isRecurring: newTaskIsRecurring.value,
                notifyEnabled: newTaskNotifyEnabled.value,
                notifyTime: newTaskNotifyEnabled.value ? newTaskNotifyTime.value : null,
                deadline: (!newTaskIsRecurring.value && newTaskNotifyEnabled.value) ? newTaskDeadlineDate.value : null
            })
        })
        const data = await res.json()
        if (data.success) {
            tasks.value.push(data.task)
            showAddModal.value = false
            newTaskTitle.value = ''
            newTaskInterval.value = null
            newTaskIsRecurring.value = false
            newTaskNotifyEnabled.value = false
            newTaskNotifyTime.value = '09:00'
            newTaskDeadlineDate.value = ''
        } else {
            console.error("Add Error:", data.error)
            alert("Error: " + data.error)
        }
    } catch (err) {
        console.error("Add Error:", err)
    }
}

const openEditModal = (task: Task) => {
    editingTask.value = { ...task }
    // Initialize deadline date from current deadline or interval
    if (editingTask.value.deadline) {
        editingTask.value.deadlineDate = editingTask.value.deadline.split('T')[0]
    } else {
         const tomorrow = new Date()
         tomorrow.setDate(tomorrow.getDate() + (task.interval || 1))
         editingTask.value.deadlineDate = tomorrow.toISOString().split('T')[0]
    }
    showEditModal.value = true
}

const updateTask = async () => {
    if (!editingTask.value || !editingTask.value.title.trim()) return

    // Validation logic similar to addTask but for editingTask
    if (!editingTask.value.isRecurring && editingTask.value.notifyEnabled && !editingTask.value.deadlineDate) {
        alert("Lütfen bir tarih seçin.")
        return
    }

    try {
        const res = await fetch("/api/tasks/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ 
                id: editingTask.value.id,
                title: editingTask.value.title,
                interval: editingTask.value.interval,
                isRecurring: editingTask.value.isRecurring,
                notifyEnabled: editingTask.value.notifyEnabled,
                notifyTime: editingTask.value.notifyEnabled ? editingTask.value.notifyTime : null,
                deadline: (!editingTask.value.isRecurring && editingTask.value.notifyEnabled) ? editingTask.value.deadlineDate : null
            })
        })
        const data = await res.json()
        if (data.success) {
            const index = tasks.value.findIndex(t => t.id === editingTask.value!.id)
            if (index !== -1) {
                tasks.value[index] = data.task
            }
            showEditModal.value = false
            editingTask.value = null
        } else {
            console.error("Update Error:", data.error)
             alert("Error: " + data.error)
        }
    } catch (err) {
        console.error("Update Error:", err)
    }
}

const confirmDelete = (task: Task) => {
    taskToDelete.value = task
    showDeleteModal.value = true
}

const deleteTask = async () => {
    if (!taskToDelete.value) return

    try {
        const res = await fetch("/api/tasks/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ id: taskToDelete.value.id })
        })
        const data = await res.json()
        if (data.success) {
            tasks.value = tasks.value.filter(t => t.id !== taskToDelete.value!.id)
            showDeleteModal.value = false
            taskToDelete.value = null
        } else {
            console.error("Delete Error:", data.error)
        }
    } catch (err) {
        console.error("Delete Error:", err)
    }
}

const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })
}
</script>
<template>
    <div class="tasks-view">
        <div class="header">
            <h1>Tasks View</h1>
            <button class="btn-add" @click="openAddModal">+ Add Task</button>
        </div>
        
        <div class="tasks">
                <h3>~ Tasks ~</h3>
                <div v-if="isLoading">Loading...</div>
                                <TransitionGroup v-else name="task-fade" tag="div" class="tasks-list">
                    <div 
                        :class="[
                          task.completed ? 'task-completed' : 'task',
                          isHighlightedCompletion(task) ? 'task-completed-highlight' : ''
                        ]" 
                        :style="{ opacity: taskOpacity(task) }"
                        v-for="task in sortedTasks" 
                        :key="task.id"
                    >
                        <div class="task-content">
                            <input 
                                type="checkbox" 
                                :checked="task.completed" 
                                @change="toggleTask(task)" 
                            />
                            <div class="task-info">
                                <span :style="overdueTextStyle(task)">{{ task.title }}</span>
                                <small v-if="task.deadline" class="task-deadline">
                                    <span :style="overdueTextStyle(task)">{{ formatDate(task.deadline) }}</span>
                                    <span v-if="task.isRecurring">↻</span>
                                </small>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="btn-icon" @click="openEditModal(task)">✎</button>
                            <button class="btn-icon btn-delete" @click="confirmDelete(task)">🗑</button>
                        </div>
                    </div>
                </TransitionGroup>
        </div>

        <!-- Modals -->
        <div v-if="showAddModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>Add New Task</h3>
                    <button
                        class="notify-toggle"
                        type="button"
                        :class="{ 'notify-toggle--on': newTaskNotifyEnabled }"
                        @click="toggleNewTaskNotifications"
                        aria-label="Bildirimleri aç/kapat"
                        title="Bildirim"
                    >
                        <span class="notify-toggle__icon" v-html="newTaskNotifyEnabled ? NOTIFY_ON_SVG : NOTIFY_OFF_SVG" />
                    </button>
                </div>
                <input v-model="newTaskTitle" placeholder="Task title" @keyup.enter="addTask" />
                
                <div class="form-group checkbox-group">
                    <label>
                        <input type="checkbox" v-model="newTaskIsRecurring" />
                        Döngüye al (Recurring)
                    </label>
                </div>

                <!-- Date picker for non-recurring + notify -->
                <div class="form-group" v-if="!newTaskIsRecurring && newTaskNotifyEnabled">
                    <label>Tarih:</label>
                    <input type="date" v-model="newTaskDeadlineDate" />
                </div>

                <!-- Input for Recurring or No-Notify -->
                <div class="form-group" v-else>
                    <div v-if="newTaskIsRecurring && newTaskNotifyEnabled" class="inline-form-row">
                        <span>Notify at every</span>
                        <input class="inline-number-input" type="number" v-model="newTaskInterval" placeholder="#" min="1" />
                        <span>day</span>
                    </div>
                    <div v-else>
                        <label>Duration (Days):</label>
                        <input type="number" v-model="newTaskInterval" placeholder="e.g. 1 for daily" min="1" />
                    </div>
                </div>

                <div v-if="newTaskNotifyEnabled" class="form-group">
                    <label>Bildirim Saati:</label>
                    <input class="time-input" type="time" v-model="newTaskNotifyTime" />
                </div>

                <div class="modal-actions">
                    <button @click="showAddModal = false">Cancel</button>
                    <button class="btn-primary" @click="addTask">Add</button>
                </div>
            </div>
        </div>

        <div v-if="showEditModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>Edit Task</h3>
                    <button
                        class="notify-toggle"
                        type="button"
                        :class="{ 'notify-toggle--on': editingTask?.notifyEnabled }"
                        @click="editingTask && (editingTask.notifyEnabled = !editingTask.notifyEnabled)"
                        aria-label="Bildirimleri aç/kapat"
                        title="Bildirim"
                    >
                        <span class="notify-toggle__icon" v-html="editingTask?.notifyEnabled ? NOTIFY_ON_SVG : NOTIFY_OFF_SVG" />
                    </button>
                </div>
                <input v-if="editingTask" v-model="editingTask.title" @keyup.enter="updateTask" />
                
                <div class="form-group checkbox-group" v-if="editingTask">
                    <label>
                        <input type="checkbox" v-model="editingTask.isRecurring" />
                        Döngüye al (Recurring)
                    </label>
                </div>
                
                <!-- Date picker for non-recurring + notify (Edit) -->
                <div class="form-group" v-if="editingTask && !editingTask.isRecurring && editingTask.notifyEnabled">
                    <label>Tarih:</label>
                    <input type="date" v-model="editingTask.deadlineDate" />
                </div>

                <!-- Input for Recurring or No-Notify (Edit) -->
                <div class="form-group" v-else-if="editingTask">
                    <div v-if="editingTask.isRecurring && editingTask.notifyEnabled" class="inline-form-row">
                         <span>Notify at every</span>
                         <input class="inline-number-input" type="number" v-model="editingTask.interval" placeholder="#" min="1" />
                         <span>day</span>
                    </div>
                    <div v-else>
                        <label>Duration (Days):</label>
                        <input type="number" v-model="editingTask.interval" placeholder="e.g. 1 for daily" min="1" />
                    </div>
                </div>

                <div v-if="editingTask?.notifyEnabled" class="form-group">
                    <label>Bildirim Saati:</label>
                    <input class="time-input" type="time" v-model="editingTask.notifyTime" />
                </div>

                <div class="modal-actions">
                    <button @click="showEditModal = false">Cancel</button>
                    <button class="btn-primary" @click="updateTask">Save</button>
                </div>
            </div>
        </div>

        <div v-if="showDeleteModal" class="modal-overlay">
            <div class="modal">
                <h3>Delete Task</h3>
                <p>Are you sure you want to delete this task?</p>
                <div class="modal-actions">
                    <button @click="showDeleteModal = false">Cancel</button>
                    <button class="btn-danger" @click="deleteTask">Delete</button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
 .tasks {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 1rem;
    margin-bottom: 1rem;
 }

 .tasks-list {
     display: flex;
     flex-direction: column;
     gap: 15px;
 }

 .task {
     position: relative;
     background-color: var(--color-surface);
     padding: 15px 20px;
     border-radius: 8px;
     border: 1px solid var(--color-text-primary);
     transition: background-color 0.3s ease, opacity 0.3s linear;
     display: flex;
     justify-content: space-between;
     align-items: center;
 }

 .task-completed {
      position: relative;
      background-color: var(--color-primary);
      padding: 15px 20px;
      border-radius: 8px;
      border: 1px solid black;
      color: var(--color-text-secondary);
    transition: background-color 0.3s ease, opacity 0.3s linear;
      display: flex;
      justify-content: space-between;
      align-items: center;
}

.task-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.task-info {
    display: flex;
    flex-direction: column;
}

.task-deadline {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-top: 2px;
}

.task-completed .task-content span {
    text-decoration: line-through;
}

.tasks input[type="checkbox"] {
  cursor: pointer;
  border-radius: 4px;
}

.tasks input[type="checkbox"]:checked {
  box-shadow: 0 0 0 1px var(--color-text-primary);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-add {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

.task-actions {
    display: flex;
    gap: 5px;
}

.task-fade-enter-active,
.task-fade-leave-active {
    transition: opacity 500ms ease;
}

.task-fade-enter-from,
.task-fade-leave-to {
    opacity: 0;
}

.task-completed-highlight {
    animation: completed-pop 220ms ease-out;
}

@keyframes completed-pop {
    0% {
        transform: scale(1);
        filter: contrast(1);
    }
    60% {
        transform: scale(1.015);
        filter: contrast(1.15);
    }
    100% {
        transform: scale(1);
        filter: contrast(1);
    }
}

.btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 4px;
    opacity: 0.6;
}

.btn-icon:hover {
    opacity: 1;
}

.btn-delete:hover {
    color: red;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background: var(--color-background);
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
}

.notify-toggle {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.9);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 180ms ease, background-color 200ms ease, box-shadow 200ms ease;
}

.notify-toggle:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}

.notify-toggle--on {
    background: var(--color-primary);
    border-color: rgba(0, 0, 0, 0.12);
    animation: notify-pop 220ms ease-out;
}

.notify-toggle--on .notify-toggle__icon :deep(svg) {
    fill: white;
}

.notify-toggle__icon {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.notify-toggle__icon :deep(svg) {
    width: 18px;
    height: 18px;
}

@keyframes notify-pop {
    0% {
        transform: scale(0.98);
    }
    60% {
        transform: scale(1.04);
    }
    100% {
        transform: scale(1);
    }
}

.modal h3 {
    margin-top: 0;
}

.modal input {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.95rem;
}

.time-input {
    font-size: 0.95rem;
    font-variant-numeric: tabular-nums;
}

.time-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
}

.form-group {
    margin: 10px 0;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-size: 0.9rem;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-group input {
    width: auto;
    margin: 0;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
}

.modal-actions button {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    cursor: pointer;
    background: white;
}

.modal-actions .btn-primary {
    background: var(--color-primary);
    color: white;
    border: none;
}


.inline-form-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    margin-top: 15px; 
    margin-bottom: 15px;
}

.inline-number-input {
    width: 60px !important;
    min-width: 50px;
    margin: 0 !important;
    text-align: center;
    padding: 6px !important;
}
.modal-actions .btn-danger {
    background: #dc3545;
    color: white;
    border: none;
}
</style>
