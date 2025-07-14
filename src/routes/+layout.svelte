<script lang="ts">
    import { type Snippet } from "svelte";
    import { getContext, setContext } from "svelte";
    import { type ProjectContainer } from "$lib/project";

    import "$lib/main.css"
    import Navbar from "$lib/components/nav/Navbar.svelte";
    import NavItem from "$lib/components/nav/NavItem.svelte";
    // import NavText from "$lib/components/nav/NavText.svelte";

    let { children }: { children: Snippet } = $props();
    
    // const currentProject: () => ProjectContainer = () => {
    //     let c: () => ProjectContainer = getContext("project");
    //     const defaultNullProject = $state({
    //         containerPath: "",
    //         manifest: {
    //             createdAt: "",
    //             modifiedAt: "", 
    //             id: "",
    //             name: "No project loaded",
    //             rackSize: -1,
    //             textures: [],
    //             version: "1.0"
    //         }
    //     })
    //     if (c == null) {
    //         setContext("project", () => defaultNullProject);
    //     }
    //     c = getContext("project");
    //     return c()
    // };
    // const currentProject: () => unknown = getContext("project");
    // $inspect(currentProject());
    // const currentProjectJson = JSON.stringify((getContext("project") as () => ProjectContainer)());
</script>

<Navbar>
    <NavItem text="Home" href="/" title="Home screen" />
    <NavItem text="Projects" href="/projects" title="Project manager" />
    <NavItem text="Editor" href="/editor" title="Editor" />

    <!-- <NavText text={currentProject().manifest.name} /> -->
</Navbar>

<main>
    {@render children()}
</main>