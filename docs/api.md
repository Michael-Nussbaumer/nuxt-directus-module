# API Usage

The `useDirectusApi()` composable provides convenient methods for CRUD operations on Directus collections.

## Usage

```vue
<script setup lang="ts">
const { getItems, getItem, createOne, createMany, updateOne, updateMany, deleteOne, deleteMany, customRequest, client } = useDirectusApi();
</script>
```

## Read Operations

### `getItems(collection, query?)`

Fetch multiple items from a collection.

**Parameters:**

- `collection` (string) - Collection name
- `query` (Query, optional) - Directus query object

**Returns:** `Promise<T[]>`

```typescript
const { getItems } = useDirectusApi();

// Get all posts
const posts = await getItems("posts");

// With query
const recentPosts = await getItems("posts", {
    limit: 10,
    sort: ["-date_created"],
    filter: {
        status: { _eq: "published" },
    },
    fields: ["id", "title", "content", "author.*"],
});

// With TypeScript
interface Post {
    id: string;
    title: string;
    content: string;
}

const posts = await getItems<Post>("posts");
```

**Query Options:**

- `limit` - Number of items to return
- `offset` - Skip first N items
- `sort` - Sort by fields (prefix with `-` for descending)
- `filter` - Filter conditions
- `fields` - Select specific fields
- `search` - Full-text search
- `deep` - Deep query object for relational data

### `getItem(collection, id, query?)`

Fetch a single item by ID.

**Parameters:**

- `collection` (string) - Collection name
- `id` (string | number) - Item ID
- `query` (Query, optional) - Directus query object

**Returns:** `Promise<T>`

```typescript
const { getItem } = useDirectusApi();

// Get post by ID
const post = await getItem("posts", "123");

// With fields selection
const post = await getItem("posts", "123", {
    fields: ["*", "author.*", "comments.*"],
});

// With TypeScript
interface Post {
    id: string;
    title: string;
    author: {
        name: string;
        email: string;
    };
}

const post = await getItem<Post>("posts", "123");
```

## Create Operations

### `createOne(collection, item)`

Create a single item.

**Parameters:**

- `collection` (string) - Collection name
- `item` (Partial<T>) - Item data

**Returns:** `Promise<T>`

```typescript
const { createOne } = useDirectusApi();

// Create a post
const newPost = await createOne("posts", {
    title: "Hello World",
    content: "My first post",
    status: "published",
});

console.log(newPost.id); // Auto-generated ID
```

### `createMany(collection, items)`

Create multiple items in one request.

**Parameters:**

- `collection` (string) - Collection name
- `items` (Partial<T>[]) - Array of item data

**Returns:** `Promise<T[]>`

```typescript
const { createMany } = useDirectusApi();

// Create multiple posts
const newPosts = await createMany("posts", [
    { title: "Post 1", content: "Content 1" },
    { title: "Post 2", content: "Content 2" },
    { title: "Post 3", content: "Content 3" },
]);
```

## Update Operations

### `updateOne(collection, id, item)`

Update a single item.

**Parameters:**

- `collection` (string) - Collection name
- `id` (string | number) - Item ID
- `item` (Partial<T>) - Updated data

**Returns:** `Promise<T>`

```typescript
const { updateOne } = useDirectusApi();

// Update post
const updatedPost = await updateOne("posts", "123", {
    title: "Updated Title",
    content: "Updated content",
});
```

### `updateMany(collection, ids, data)`

Update multiple items with the same data.

**Parameters:**

- `collection` (string) - Collection name
- `ids` ((string | number)[]) - Array of item IDs
- `data` (Partial<T>) - Data to apply to all items

**Returns:** `Promise<T[]>`

```typescript
const { updateMany } = useDirectusApi();

// Publish multiple posts
const updated = await updateMany("posts", ["1", "2", "3"], {
    status: "published",
});
```

## Delete Operations

### `deleteOne(collection, id)`

Delete a single item.

**Parameters:**

- `collection` (string) - Collection name
- `id` (string | number) - Item ID

**Returns:** `Promise<void>`

```typescript
const { deleteOne } = useDirectusApi();

// Delete post
await deleteOne("posts", "123");
```

### `deleteMany(collection, ids)`

Delete multiple items.

**Parameters:**

- `collection` (string) - Collection name
- `ids` ((string | number)[]) - Array of item IDs

**Returns:** `Promise<void>`

```typescript
const { deleteMany } = useDirectusApi();

// Delete multiple posts
await deleteMany("posts", ["1", "2", "3"]);
```

## Custom Requests

### `customRequest(path, options?)`

Make a custom API request.

**Parameters:**

- `path` (string) - API endpoint path
- `options` (RequestInit, optional) - Fetch options

**Returns:** `Promise<T>`

```typescript
const { customRequest } = useDirectusApi();

// Custom endpoint
const stats = await customRequest("/items/posts/stats");

// With options
const result = await customRequest("/custom-endpoint", {
    method: "POST",
    body: JSON.stringify({ data: "value" }),
});
```

## Direct Client Access

Access the Directus client directly for advanced usage.

```typescript
const { client } = useDirectusApi();

// Use client directly
import { aggregate } from "@directus/sdk";

const result = await client.request(
    aggregate("posts", {
        aggregate: { count: "*" },
        groupBy: ["status"],
    }),
);
```

## Complete CRUD Example

```vue
<template>
    <div>
        <h1>Posts</h1>

        <!-- Create Form -->
        <form @submit.prevent="createPost">
            <input v-model="newPost.title" placeholder="Title" />
            <textarea v-model="newPost.content" placeholder="Content" />
            <button type="submit">Create Post</button>
        </form>

        <!-- Posts List -->
        <div v-for="post in posts" :key="post.id">
            <h2>{{ post.title }}</h2>
            <p>{{ post.content }}</p>

            <button @click="editPost(post)">Edit</button>
            <button @click="deletePost(post.id)">Delete</button>
        </div>

        <!-- Edit Modal -->
        <div v-if="editingPost">
            <input v-model="editingPost.title" />
            <textarea v-model="editingPost.content" />
            <button @click="savePost">Save</button>
            <button @click="editingPost = null">Cancel</button>
        </div>
    </div>
</template>

<script setup lang="ts">
const { getItems, createOne, updateOne, deleteOne } = useDirectusApi();

interface Post {
    id: string;
    title: string;
    content: string;
}

const posts = ref<Post[]>([]);
const newPost = ref({ title: "", content: "" });
const editingPost = ref<Post | null>(null);

// Fetch posts
const fetchPosts = async () => {
    posts.value = await getItems<Post>("posts", {
        sort: ["-date_created"],
    });
};

// Create post
const createPost = async () => {
    await createOne("posts", newPost.value);
    newPost.value = { title: "", content: "" };
    await fetchPosts();
};

// Edit post
const editPost = (post: Post) => {
    editingPost.value = { ...post };
};

// Save post
const savePost = async () => {
    if (editingPost.value) {
        await updateOne("posts", editingPost.value.id, {
            title: editingPost.value.title,
            content: editingPost.value.content,
        });
        editingPost.value = null;
        await fetchPosts();
    }
};

// Delete post
const deletePost = async (id: string) => {
    if (confirm("Delete this post?")) {
        await deleteOne("posts", id);
        await fetchPosts();
    }
};

// Initial fetch
onMounted(() => {
    fetchPosts();
});
</script>
```

## Advanced Filtering

```typescript
const { getItems } = useDirectusApi();

// Exact match
const published = await getItems("posts", {
    filter: { status: { _eq: "published" } },
});

// Multiple conditions
const recentPublished = await getItems("posts", {
    filter: {
        _and: [{ status: { _eq: "published" } }, { date_created: { _gte: "$NOW(-7 days)" } }],
    },
});

// OR conditions
const draftOrArchived = await getItems("posts", {
    filter: {
        _or: [{ status: { _eq: "draft" } }, { status: { _eq: "archived" } }],
    },
});

// Contains text
const searchResults = await getItems("posts", {
    filter: {
        title: { _contains: "search term" },
    },
});

// In array
const specificPosts = await getItems("posts", {
    filter: {
        id: { _in: ["1", "2", "3"] },
    },
});
```

## Relational Data

```typescript
const { getItems } = useDirectusApi();

// Load related data
const posts = await getItems("posts", {
    fields: [
        "*", // All post fields
        "author.*", // All author fields
        "comments.*", // All comment fields
        "comments.user.*", // Nested: comment users
        "tags.tag_id.*", // Many-to-many through junction
    ],
});

// Filter by relation
const authorPosts = await getItems("posts", {
    filter: {
        "author.name": { _eq: "John Doe" },
    },
    fields: ["*", "author.name"],
});
```

## Pagination

```typescript
const { getItems } = useDirectusApi();

const page = ref(1);
const perPage = 20;

const posts = await getItems("posts", {
    limit: perPage,
    offset: (page.value - 1) * perPage,
    meta: "total_count", // Include total count in response
});
```

## Error Handling

```typescript
const { getItems } = useDirectusApi();

try {
    const posts = await getItems("posts");
} catch (error) {
    console.error("Failed to fetch posts:", error);
    // Handle error (show notification, etc.)
}
```
