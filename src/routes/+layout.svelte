<script lang="ts">
    import { type Snippet } from "svelte";

    import "$lib/main.css"
    import Navbar from "$lib/components/nav/Navbar.svelte";
    import NavItem from "$lib/components/nav/NavItem.svelte";
    import type { svelte } from "@sveltejs/vite-plugin-svelte";

    let { children }: { children: Snippet } = $props();
</script>

<Navbar>
    <NavItem text="Home" href="/" title="Home screen" />
    <NavItem text="Projects" href="/projects" title="Project manager" />
</Navbar>

<main>
    {@render children()}
</main>