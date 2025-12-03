<script setup lang="ts">
import { ref, computed, vModelCheckbox } from 'vue'

const tasks = ref([
    { id: 1, title: 'Task One', completed: false },
    { id: 2, title: 'Task Two', completed: true },
    { id: 3, title: 'Task Three', completed: false },
])

const currentTasks = computed(() => tasks.value.filter(t => !t.completed))
const completedTasks = computed(() => tasks.value.filter(t => t.completed))
</script>
<template>
    <div class="tasks-view">
        <h1>Tasks View</h1>
        <div class="tasks">
            <div class="current-tasks">
                <h3>~ Current Tasks ~</h3>
                <label class="task" v-for="task in currentTasks" :key="task.id">
                    <input type="checkbox" v-model="task.completed" />
                    {{ task.title }}
                </label>
            </div>
            <div class="completed-tasks">
                <h3 style="color: var(--color-primary);">~ Completed Tasks ~</h3>
                <label class="task" v-for="task in completedTasks" :key="task.id">
                    <input type="checkbox" v-model="task.completed" />
                    {{ task.title }}
                </label>
            </div>
        </div>
    </div>
</template>
<style scoped>
 .tasks, .current-tasks, .completed-tasks {
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
 }
</style>