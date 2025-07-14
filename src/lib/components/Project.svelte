<script lang="ts">
    import { type ProjectContainer } from "$lib/project";
    import { setContext, getContext } from "svelte";
    import { Alert } from "flowbite-svelte";


    let { projectObject } = $props();

    // const project = ((): ProjectContainer | null => {
    //     let raw = projectObject;
    //     if (raw == null) {
    //         // console.error("Project data not given as URL parameter. Redirecting to project select screen...")
            
    //         // await ((ms: number) => {
    //         //     return new Promise(resolve => setTimeout(resolve, ms));
    //         // })(500);

    //         // goto("/projects");
    //         // make a fake project
    //         // return {
    //         //     containerPath: "",
    //         //     manifest: {
    //         //         createdAt: "",
    //         //         modifiedAt: "", 
    //         //         id: "",
    //         //         name: "No project loaded",
    //         //         rackSize: -1,
    //         //         textures: [],
    //         //         version: "1.0"
    //         //     }
    //         // };
    //         return null;
    //     } else {
    //         return JSON.parse(raw) as ProjectContainer
    //     }
    // })();

    // setContext("project", project);
</script>

<!-- {#if project == null}
    <Alert color="blue">
        No project loaded. Navigate to the Project selector to load a project.
    </Alert>
{:else}
    {JSON.stringify(project)}
{/if} -->