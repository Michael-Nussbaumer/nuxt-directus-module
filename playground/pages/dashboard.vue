<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="mx-auto max-w-4xl">
            <div class="rounded-lg bg-white p-8 shadow-lg">
                <div class="mb-8 flex items-center justify-between">
                    <h1 class="text-3xl font-bold">Dashboard</h1>
                    <button class="rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700" @click="handleLogout">Logout</button>
                </div>

                <div v-if="user" class="space-y-4">
                    <div>
                        <h2 class="mb-2 text-xl font-semibold">Welcome!</h2>
                        <p class="text-gray-600">You are logged in.</p>
                    </div>

                    <div class="rounded-md bg-gray-50 p-4">
                        <h3 class="mb-2 font-medium">User Information</h3>
                        <pre class="text-sm">{{ JSON.stringify(user, null, 2) }}</pre>
                    </div>
                </div>

                <div v-else-if="isLoading" class="py-8 text-center">
                    <p class="text-gray-600">Loading user data...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    auth: true,
});

const { user, logout, isLoading } = useDirectusAuth();

const handleLogout = async () => {
    try {
        await logout();
    } catch (e) {
        console.error("Logout error:", e);
    }
};
</script>
