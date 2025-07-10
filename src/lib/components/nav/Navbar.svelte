<script lang="ts">
    let { children } = $props();
</script>

<div class="mx-2">
    <header class="my-1 p-0">
        <ul class="flex">
            {@render children()}
        </ul>
    
    </header>
    <hr class="mb-4" />
</div>