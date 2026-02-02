import { ref, unref, computed, onUnmounted } from "vue";
import { useNuxtApp } from "#app";
import type { DirectusClient } from "@directus/sdk";

interface SubscriptionOptions {
    collection: string;
    query?: Record<string, any>;
    uid?: string; // Unique ID for subscription management
    persistent?: boolean; // Don't auto-unsubscribe on component unmount
}

interface SubscriptionHandler {
    uid: string;
    collection: string;
    unsubscribe: () => void;
    persistent: boolean;
}

// Global subscription registry to prevent duplicates
const subscriptions = new Map<string, SubscriptionHandler>();

export const useDirectusRealtime = () => {
    const { $directus, $directusWs } = useNuxtApp();
    const client = $directus as DirectusClient<any>;

    // $directusWs.isConnected is already a Ref, no need for .value in computed
    const isConnected = computed(() => unref($directusWs.isConnected));
    const localSubscriptions = ref<Set<string>>(new Set());

    /**
     * Subscribe to realtime updates for a collection
     */
    const subscribe = async <T = any>(options: SubscriptionOptions, callback: (data: T) => void) => {
        const { collection, query = {}, uid, persistent = false } = options;

        // Generate unique subscription ID
        const subscriptionId = uid || `${collection}-${JSON.stringify(query)}-${Math.random()}`;

        // Check if subscription already exists
        if (subscriptions.has(subscriptionId)) {
            console.warn(`[Directus Realtime] Subscription ${subscriptionId} already exists`);
            return subscriptions.get(subscriptionId)!;
        }

        console.log(`[Directus Realtime] Subscribing to ${collection} with ID: ${subscriptionId}`);

        try {
            // Subscribe to collection - note: this returns a Promise!
            const { subscription, unsubscribe } = await client.subscribe(collection, {
                query,
                uid: subscriptionId,
            });

            // Start listening to subscription events
            (async () => {
                try {
                    for await (const message of subscription) {
                        console.log(`[Directus Realtime] Event received for ${collection}:`, message);
                        callback(message as T);
                    }
                } catch (error) {
                    console.error(`[Directus Realtime] Subscription error for ${collection}:`, error);
                }
            })();

            // Create handler
            const handler: SubscriptionHandler = {
                uid: subscriptionId,
                collection,
                unsubscribe,
                persistent,
            };

            // Register subscription
            subscriptions.set(subscriptionId, handler);

            // Track in local component subscriptions (for auto-cleanup)
            if (!persistent) {
                localSubscriptions.value.add(subscriptionId);
            }

            return handler;
        } catch (error) {
            console.error(`[Directus Realtime] Error subscribing to ${collection}:`, error);
            throw error;
        }
    };

    /**
     * Unsubscribe from a specific subscription
     */
    const unsubscribe = (subscriptionId: string) => {
        const handler = subscriptions.get(subscriptionId);

        if (!handler) {
            console.warn(`[Directus Realtime] Subscription ${subscriptionId} not found`);
            return;
        }

        console.log(`[Directus Realtime] Unsubscribing from ${handler.collection} (${subscriptionId})`);

        try {
            handler.unsubscribe();
            subscriptions.delete(subscriptionId);
            localSubscriptions.value.delete(subscriptionId);
        } catch (error) {
            console.error(`[Directus Realtime] Error unsubscribing from ${subscriptionId}:`, error);
        }
    };

    /**
     * Unsubscribe from all subscriptions for a collection
     */
    const unsubscribeCollection = (collection: string) => {
        const toRemove: string[] = [];

        subscriptions.forEach((handler, id) => {
            if (handler.collection === collection && !handler.persistent) {
                toRemove.push(id);
            }
        });

        toRemove.forEach((id) => unsubscribe(id));
    };

    /**
     * Unsubscribe from all non-persistent subscriptions
     */
    const unsubscribeAll = () => {
        const toRemove: string[] = [];

        subscriptions.forEach((handler, id) => {
            if (!handler.persistent) {
                toRemove.push(id);
            }
        });

        toRemove.forEach((id) => unsubscribe(id));
    };

    /**
     * Get active subscriptions
     */
    const getActiveSubscriptions = () => {
        return Array.from(subscriptions.values());
    };

    /**
     * Check if a subscription exists
     */
    const hasSubscription = (subscriptionId: string) => {
        return subscriptions.has(subscriptionId);
    };

    /**
     * Send a message through WebSocket
     */
    const sendMessage = (message: any) => {
        try {
            client.sendMessage(message);
        } catch (error) {
            console.error("[Directus Realtime] Error sending message:", error);
            throw error;
        }
    };

    /**
     * Reconnect WebSocket
     */
    const reconnect = () => {
        try {
            $directusWs.initialize();
        } catch (error) {
            console.error("[Directus Realtime] Error reconnecting:", error);
            throw error;
        }
    };

    // Auto-cleanup non-persistent subscriptions on component unmount
    onUnmounted(() => {
        localSubscriptions.value.forEach((id) => {
            unsubscribe(id);
        });
    });

    return {
        // Connection state
        isConnected,

        // Subscription management
        subscribe,
        unsubscribe,
        unsubscribeCollection,
        unsubscribeAll,

        // Subscription info
        getActiveSubscriptions,
        hasSubscription,

        // WebSocket controls
        sendMessage,
        reconnect,

        // Direct client access
        client,
    };
};
