<script lang="ts">
    import { type PageProps } from "./$types";
    let { data }: PageProps = $props();
</script>



<ul>
    {#each data.projects as project}
        <li>
            {project.name} &nbsp;
            {project.path}
        </li>
    {/each}
</ul>
