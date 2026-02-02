<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div class="max-w-md w-full rounded-lg bg-white p-8 shadow-lg">
            <h1 class="mb-8 text-center text-3xl font-bold">Login</h1>

            <form class="space-y-4" @submit.prevent="handleLogin">
                <div>
                    <label for="email" class="mb-1 block text-sm text-gray-700 font-medium"> Email </label>
                    <input id="email" v-model="email" type="email" required class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
                </div>

                <div>
                    <label for="password" class="mb-1 block text-sm text-gray-700 font-medium"> Password </label>
                    <input id="password" v-model="password" type="password" required class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                </div>

                <button type="submit" :disabled="isLoading" class="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition disabled:cursor-not-allowed hover:bg-blue-700 disabled:opacity-50">
                    {{ isLoading ? "Logging in..." : "Login" }}
                </button>

                <p v-if="error" class="text-center text-sm text-red-600">
                    {{ error }}
                </p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: "/dashboard",
    },
});

const { login, isLoading, error } = useDirectusAuth();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
    try {
        await login({
            email: email.value,
            password: password.value,
        });
    } catch (e) {
        console.error("Login error:", e);
    }
};
</script>
