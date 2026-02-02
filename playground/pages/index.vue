<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div class="max-w-md w-full rounded-lg bg-white p-8 text-center shadow-lg">
            <h1 class="mb-4 text-4xl font-bold">Nuxt Directus Module</h1>
            <p class="mb-8 text-gray-600">A production-ready module with auth and type generation</p>

            <div class="space-y-3">
                <NuxtLink to="/login" class="block w-full rounded-md bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700"> Go to Login </NuxtLink>

                <NuxtLink to="/dashboard" class="block w-full rounded-md bg-gray-200 px-4 py-3 text-gray-700 transition hover:bg-gray-300"> Go to Dashboard </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    auth: false,
});
</script>
