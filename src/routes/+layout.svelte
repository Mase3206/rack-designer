<script lang="ts">
    import { type Snippet } from "svelte";
    import { type Project, ProjectManager as pm } from "$lib/project";

    import "$lib/main.css"
    import Navbar from "$lib/components/nav/Navbar.svelte";
    import NavItem from "$lib/components/nav/NavItem.svelte";
    import NavText from "$lib/components/nav/NavText.svelte";

    let { children }: { children: Snippet } = $props();
</script>

<Navbar>
    <NavItem text="Home" href="/" title="Home screen" />
    <NavItem text="Projects" href="/projects" title="Project manager" />
    <NavItem text="Editor" href="/editor" title="Editor" />

    {#await pm.getCurrentProject() then current}
        <NavText text={current.manifest.name} />
    {:catch error}
        <NavText text={error} />
    {/await}
</Navbar>

<main>
    {@render children()}
</main>