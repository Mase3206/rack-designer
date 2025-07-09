<script lang="ts">
    import { type Snippet } from "svelte";

    let {
        text,
        href,
        title,
        classes = ""
    }: {
        text: string;
        href: string;
        title: string;
        classes?: string;
    } = $props();
</script>


<li class="mt-0 px-3 py-2 mr-2 text-base nav-item hover:bg-gray-600 rounded-md">
    <a {href} {title} class="{classes}">{text}</a>
</li>
