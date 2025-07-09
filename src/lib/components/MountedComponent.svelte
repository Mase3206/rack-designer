<script lang="ts">
    import { type Texture } from "$lib/project";
    
    let { texture }: { texture: Texture } = $props();
</script>

<div>
    <img src="{texture.path}" alt="{texture.originalName}" />
</div>