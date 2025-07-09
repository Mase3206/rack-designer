<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        children,
        width
    }: { children: Snippet, width: number } = $props();
</script>

<div>
    {@render children()}
</div>