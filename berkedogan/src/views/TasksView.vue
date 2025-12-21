<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Task {
  id: number
  title: string
  completed: boolean
  isRecurring?: boolean
  interval?: number
  deadline: string
}

const tasks = ref<Task[]>([])
const isLoading = ref(false)

const sortedTasks = computed<Task[]>(() => {
  return [...tasks.value].sort((a, b) => {
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

const editingTask = ref<Task | null>(null)
const taskToDelete = ref<Task | null>(null)

const fetchTasks = async () => {
    isLoading.value = true
    try {
        const res = await fetch("https://www.berkedogan.com.tr/api/tasks", {
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
    try {
        await fetch("https://www.berkedogan.com.tr/api/tasks/reset", {
            method: "POST",
            credentials: "include"
        })
    } catch (e) {
        console.error("Reset check failed", e)
    }
    await fetchTasks()
})

const toggleTask = async (task: Task) => {
    try {
        const res = await fetch("https://www.berkedogan.com.tr/api/tasks/complete", {
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
            task.completed = !task.completed
            console.error("Toggle Error:", data.error)
        }
    } catch (err) {
        task.completed = !task.completed
        console.error("Toggle Error:", err)
    }
}

const openAddModal = () => {
    newTaskTitle.value = ''
    newTaskInterval.value = null
    newTaskIsRecurring.value = false
    showAddModal.value = true
}

const addTask = async () => {
    if (!newTaskTitle.value.trim() || !newTaskInterval.value) {
        alert("Please enter both title and duration (days).")
        return
    }
    
    try {
        const res = await fetch("https://www.berkedogan.com.tr/api/tasks/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ 
                title: newTaskTitle.value,
                interval: newTaskInterval.value,
                isRecurring: newTaskIsRecurring.value
            })
        })
        const data = await res.json()
        if (data.success) {
            tasks.value.push(data.task)
            showAddModal.value = false
            newTaskTitle.value = ''
            newTaskInterval.value = null
            newTaskIsRecurring.value = false
        } else {
            console.error("Add Error:", data.error)
        }
    } catch (err) {
        console.error("Add Error:", err)
    }
}

const openEditModal = (task: Task) => {
    editingTask.value = { ...task }
    showEditModal.value = true
}

const updateTask = async () => {
    if (!editingTask.value || !editingTask.value.title.trim()) return

    try {
        const res = await fetch("https://www.berkedogan.com.tr/api/tasks/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ 
                id: editingTask.value.id,
                title: editingTask.value.title,
                interval: editingTask.value.interval,
                isRecurring: editingTask.value.isRecurring
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
        const res = await fetch("https://www.berkedogan.com.tr/api/tasks/delete", {
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
                <div 
                    v-else
                    :class="task.completed ? 'task-completed' : 'task'" 
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
                            <span>{{ task.title }}</span>
                            <small v-if="task.deadline" class="task-deadline">
                                {{ formatDate(task.deadline) }}
                                <span v-if="task.isRecurring">↻</span>
                            </small>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon" @click="openEditModal(task)">✎</button>
                        <button class="btn-icon btn-delete" @click="confirmDelete(task)">🗑</button>
                    </div>
                </div>
        </div>

        <!-- Modals -->
        <div v-if="showAddModal" class="modal-overlay">
            <div class="modal">
                <h3>Add New Task</h3>
                <input v-model="newTaskTitle" placeholder="Task title" @keyup.enter="addTask" />
                
                <div class="form-group">
                    <label>Duration (Days):</label>
                    <input type="number" v-model="newTaskInterval" placeholder="e.g. 1 for daily" min="1" />
                </div>

                <div class="form-group checkbox-group">
                    <label>
                        <input type="checkbox" v-model="newTaskIsRecurring" />
                        Döngüye al (Recurring)
                    </label>
                </div>

                <div class="modal-actions">
                    <button @click="showAddModal = false">Cancel</button>
                    <button class="btn-primary" @click="addTask">Add</button>
                </div>
            </div>
        </div>

        <div v-if="showEditModal" class="modal-overlay">
            <div class="modal">
                <h3>Edit Task</h3>
                <input v-if="editingTask" v-model="editingTask.title" @keyup.enter="updateTask" />
                
                <div class="form-group" v-if="editingTask">
                    <label>Duration (Days):</label>
                    <input type="number" v-model="editingTask.interval" placeholder="e.g. 1 for daily" min="1" />
                </div>

                <div class="form-group checkbox-group" v-if="editingTask">
                    <label>
                        <input type="checkbox" v-model="editingTask.isRecurring" />
                        Döngüye al (Recurring)
                    </label>
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

 .task {
     position: relative;
     background-color: var(--color-surface);
     padding: 15px 20px;
     border-radius: 8px;
     border: 1px solid var(--color-text-primary);
     transition: background-color 0.3s ease;
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
      transition: background-color 0.3s ease;
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

.modal h3 {
    margin-top: 0;
}

.modal input {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
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

.modal-actions .btn-danger {
    background: #dc3545;
    color: white;
    border: none;
}
</style>
