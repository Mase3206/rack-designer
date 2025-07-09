<script lang="ts">
    import "$lib/main.css"

    let { children } = $props();
</script>

<a href="/projects">Projects</a>
<a href="/">Home</a>

{@render children()}