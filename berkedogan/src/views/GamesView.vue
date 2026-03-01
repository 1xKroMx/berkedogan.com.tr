<script setup>
import { useLanguage } from '@/composables/useLanguage';
const { t, lang } = useLanguage();
</script>

<template>
     <div>
        <h1>{{ t.games }}</h1>
     </div>
</template>