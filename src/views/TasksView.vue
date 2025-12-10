<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const timeRemaining = computed(() => {
    const now = new Date()
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    const diff = endOfDay.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
})

interface Task {
  id: number
  title: string
  completed: boolean
}

const tasks = ref<Task[]>([])
const isLoading = ref(false)

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Form data
const newTaskTitle = ref('')
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

onMounted(fetchTasks)

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
            // Revert if failed
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
    showAddModal.value = true
}

const addTask = async () => {
    if (!newTaskTitle.value.trim()) return
    
    try {
        const res = await fetch("https://www.berkedogan.com.tr/api/tasks/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title: newTaskTitle.value })
        })
        const data = await res.json()
        if (data.success) {
            tasks.value.push(data.task)
            showAddModal.value = false
            newTaskTitle.value = ''
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
                title: editingTask.value.title
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
                    v-for="task in tasks" 
                    :key="task.id"
                >
                    <div class="task-content">
                        <input 
                            type="checkbox" 
                            :checked="task.completed" 
                            @change="toggleTask(task)" 
                        />
                        <span>{{ task.title }}</span>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon" @click="openEditModal(task)">✎</button>
                        <button class="btn-icon btn-delete" @click="confirmDelete(task)">🗑</button>
                    </div>
                </div>
        </div>
        <div class="daily-clock">
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#48752C"><path d="M592-302 450-444v-196h60v171l124 124-42 43ZM450-730v-90h60v90h-60Zm280 280v-60h90v60h-90ZM450-140v-90h60v90h-60ZM140-450v-60h90v60h-90ZM480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z"/></svg><small>There is {{ timeRemaining }} to new tasks.</small>
        </div>

        <!-- Modals -->
        <div v-if="showAddModal" class="modal-overlay">
            <div class="modal">
                <h3>Add New Task</h3>
                <input v-model="newTaskTitle" placeholder="Task title" @keyup.enter="addTask" />
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
.daily-clock {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
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
