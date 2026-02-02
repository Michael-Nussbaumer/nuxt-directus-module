import { useNuxtApp } from "#app";
import { readItems, readItem, createItem, createItems, updateItem, updateItems, deleteItem, deleteItems, type DirectusClient, type Query } from "@directus/sdk";

export const useDirectusApi = () => {
    const { $directus } = useNuxtApp();
    const client = $directus as DirectusClient<any>;

    /**
     * Read multiple items from a collection
     */
    const getItems = async <T = any>(collection: string, query?: Query<any, T>) => {
        try {
            return await client.request(readItems(collection, query));
        } catch (error) {
            console.error(`[Directus API] Error reading items from ${collection}:`, error);
            throw error;
        }
    };

    /**
     * Read a single item from a collection
     */
    const getItem = async <T = any>(collection: string, id: string | number, query?: Query<any, T>) => {
        try {
            return await client.request(readItem(collection, id, query));
        } catch (error) {
            console.error(`[Directus API] Error reading item ${id} from ${collection}:`, error);
            throw error;
        }
    };

    /**
     * Create a single item in a collection
     */
    const createOne = async <T = any>(collection: string, item: Partial<T>) => {
        try {
            return await client.request(createItem(collection, item));
        } catch (error) {
            console.error(`[Directus API] Error creating item in ${collection}:`, error);
            throw error;
        }
    };

    /**
     * Create multiple items in a collection
     */
    const createMany = async <T = any>(collection: string, items: Partial<T>[]) => {
        try {
            return await client.request(createItems(collection, items));
        } catch (error) {
            console.error(`[Directus API] Error creating items in ${collection}:`, error);
            throw error;
        }
    };

    /**
     * Update a single item in a collection
     */
    const updateOne = async <T = any>(collection: string, id: string | number, item: Partial<T>) => {
        try {
            return await client.request(updateItem(collection, id, item));
        } catch (error) {
            console.error(`[Directus API] Error updating item ${id} in ${collection}:`, error);
            throw error;
        }
    };

    /**
     * Update multiple items in a collection
     */
    const updateMany = async <T = any>(collection: string, ids: (string | number)[], data: Partial<T>) => {
        try {
            return await client.request(updateItems(collection, ids, data));
        } catch (error) {
            console.error(`[Directus API] Error updating items in ${collection}:`, error);
            throw error;
        }
    };

    /**
     * Delete a single item from a collection
     */
    const deleteOne = async (collection: string, id: string | number) => {
        try {
            return await client.request(deleteItem(collection, id));
        } catch (error) {
            console.error(`[Directus API] Error deleting item ${id} from ${collection}:`, error);
            throw error;
        }
    };

    /**
     * Delete multiple items from a collection
     */
    const deleteMany = async (collection: string, ids: (string | number)[]) => {
        try {
            return await client.request(deleteItems(collection, ids));
        } catch (error) {
            console.error(`[Directus API] Error deleting items from ${collection}:`, error);
            throw error;
        }
    };

    /**
     * Make a custom request to the Directus API
     */
    const customRequest = async <T = any>(path: string, options?: RequestInit) => {
        try {
            return await client.request<T>(path, options);
        } catch (error) {
            console.error(`[Directus API] Error making custom request to ${path}:`, error);
            throw error;
        }
    };

    return {
        // Read operations
        getItems,
        getItem,

        // Create operations
        createOne,
        createMany,

        // Update operations
        updateOne,
        updateMany,

        // Delete operations
        deleteOne,
        deleteMany,

        // Custom requests
        customRequest,

        // Direct client access for advanced usage
        client,
    };
};
