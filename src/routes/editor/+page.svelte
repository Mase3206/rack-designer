<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { ProjectManager as pm, type Project } from "$lib/project";
    import { setContext, getContext } from "svelte";
    import { Alert } from "flowbite-svelte";
    import Project from "$lib/components/Project.svelte";
    import { globalState } from "$lib/state.svelte";

    // const project = $state(((): ProjectContainer => {
    //     let raw = page.url.searchParams.get("project");
    //     if (raw == null) {
    //         // console.error("Project data not given as URL parameter. Redirecting to project select screen...")
            
    //         // await ((ms: number) => {
    //         //     return new Promise(resolve => setTimeout(resolve, ms));
    //         // })(500);

    //         // goto("/projects");
    //         // make a fake project
    //         return {
    //             containerPath: "",
    //             manifest: {
    //                 createdAt: "",
    //                 modifiedAt: "", 
    //                 id: "",
    //                 name: "No project loaded",
    //                 rackSize: -1,
    //                 textures: [],
    //                 version: "1.0"
    //             }
    //         };
    //         // return null
    //     } else {
    //         return JSON.parse(raw) as ProjectContainer
    //     }
    // })());
    // setContext("project", () => project);

    // if (project!.containerPath == "") {
    //     console.warn("Project data not given as URL parameter. Redirecting to project select screen...")
    //     goto("/projects");
    // }

    // const project = ((): ProjectContainer | null => {
    //     let p: ProjectContainer
    //     let existing = getContext("project") as ProjectContainer;
    //     if (existing == undefined) {
    //         let raw = page.url.searchParams.get("project");
    //         if (raw == null) {
    //             // console.error("Project data not given as URL parameter. Redirecting to project select screen...")
                
    //             // await ((ms: number) => {
    //             //     return new Promise(resolve => setTimeout(resolve, ms));
    //             // })(500);
    
    //             // goto("/projects");
    //             // make a fake project
    //             // return {
    //             //     containerPath: "",
    //             //     manifest: {
    //             //         createdAt: "",
    //             //         modifiedAt: "", 
    //             //         id: "",
    //             //         name: "No project loaded",
    //             //         rackSize: -1,
    //             //         textures: [],
    //             //         version: "1.0"
    //             //     }
    //             // };
    //             p = new Object as ProjectContainer;
    //         } else {
    //             try {
    //                 p = JSON.parse(raw) as ProjectContainer
    //             } catch (error) {
    //                 p = new Object as ProjectContainer;
    //             }
    //         }
    //     } else {
    //         p = existing;
    //     }

    //     return p;
    // })();

    // setContext("project", project);
    // $inspect(project);
</script>

{#if globalState.activeProject == null}
    <Alert color="blue">
        <span class="font-md">Info</span>
        No project loaded. Redirecting ot project select screen...
    </Alert>
{:else}
    {JSON.stringify(globalState.activeProject)}
{/if}

<!-- <Project projectObject={page.url.searchParams.get("project")} /> -->