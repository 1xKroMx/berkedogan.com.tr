<script setup lang="ts">
import { ref, computed, vModelCheckbox, onMounted } from 'vue'

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

onMounted(async () => {
    try {
        const token = localStorage.getItem("jwt")
        if (!token) return console.error("JWT Missing")

        const res = await fetch("https://www.berkedogan.com.tr/api/tasks", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const data = await res.json()

        if (data.success) {
            tasks.value = data.tasks
        } else {
            console.error("API Error:", data.error)
        }
    } catch (err) {
        console.error("Fetch Error:", err)
    }
})
</script>
<template>
    <div class="tasks-view">
        <h1>Tasks View</h1>
        <div class="tasks">
                <h3>~ Tasks ~</h3>
                <label :class="task.completed ? 'task-completed' : 'task'" v-for="task in tasks" :key="task.id">
                    <input type="checkbox" v-model="task.completed" />
                    {{ task.title }}
                </label>
        </div>
        <div class="daily-clock">
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#48752C"><path d="M592-302 450-444v-196h60v171l124 124-42 43ZM450-730v-90h60v90h-60Zm280 280v-60h90v60h-90ZM450-140v-90h60v90h-60ZM140-450v-60h90v60h-90ZM480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z"/></svg><small>There is {{ timeRemaining }} to new tasks.</small>
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
     padding: 20px;
     border-radius: 8px;
     border: 1px solid var(--color-text-primary);
     transition: background-color 0.3s ease;
 }

 .task-completed {
      position: relative;
      background-color: var(--color-primary);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid black;
      text-decoration: line-through;
      color: var(--color-text-secondary);
      transition: background-color 0.3s ease;
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
</style>