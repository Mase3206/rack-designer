<script lang="ts">
    import { type PageProps } from "./$types";
    import { Modal, Button, Label, Input } from "flowbite-svelte";
    import { ProjectManager as pm, type ProjectContainer } from "$lib/project";
    import { setContext } from "svelte";

    let { data }: PageProps = $props();
    let newModalIsOpen = $state(false);
    // let projectContainer: ProjectContainer | undefined = $state();

    async function onSubmitNew(ev: SubmitEvent) {
        const formData = new FormData(ev.target as HTMLFormElement);

        // Check the data validity and prevent dialog closing if needed.
        // if( ! checkValid(formData) ) ev.preventDefault();

        const object = Object.fromEntries(formData) as {projectName: string};
        alert(JSON.stringify(object));
        let projectContainer = await pm.createProject(object.projectName);
        // loadProject(projectContainer);
    }
</script>


<!-- subnav -->
<div>
    <h1>Projects</h1>
    <Button color="alternative" onclick={() => (newModalIsOpen = true)}>New</Button>
    <Button color="alternative" onclick={() => pm.openProject()}>Open from...</Button>
    <!-- <button onclick={() => (newModalIsOpen = true)}>New</button> -->
</div>

<!-- new project modal -->
<Modal title="New project" bind:open={newModalIsOpen} size="xs" onsubmit={onSubmitNew} autoclose>
    <form action="#" method="dialog">
        <Label>
            Project name
            <Input type="string" name="projectName" placeholder="" required />
        </Label>
        <Button type="submit">Create project</Button>
    </form>
</Modal>


<ul>
    {#each data.projects as project}
        <li>
            {project.manifest.name} &nbsp;
            {project.manifest.modifiedAt}
        </li>
    {/each}
</ul>
