import { ref, computed } from 'vue';
import { messages, type Lang } from '@/i18n';

const lang = ref<Lang>(
    (localStorage.getItem('lang') as Lang) || 'tr'
);

export function useLanguage() {
    const setLang = (l: Lang) => {
        lang.value = l;
        localStorage.setItem('lang', l);
    };

    const t = computed(() => messages[lang.value]);

    return {
        lang,
        t,
        setLang
    };
}