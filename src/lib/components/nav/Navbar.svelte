<script lang="ts">
    let { children } = $props();
</script>

<header class="flex mx-3 my-2 p-0">
    <ul class="flex">
        {@render children()}
    </ul>
</header>