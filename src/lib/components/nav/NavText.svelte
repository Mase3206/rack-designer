<script lang="ts">
    let { text, floatRight = true, classes = [] }: { text: string, floatRight?: boolean, classes?: string[] } = $props();
</script>

<p class="my-2 mr-2 {floatRight ? "ml-auto" : ""}">
    {text}
</p>