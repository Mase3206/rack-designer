<script lang="ts">
    import { page } from "$app/state";

    // const thisPath = $derived(page.url.pathname);

    let {
        text,
        href,
        title,
        classes = []
    }: {
        text: string;
        href: string;
        title: string;
        classes?: string[];
    } = $props();

    // let isActive = $derived(page.url.pathname == href);

    // if ((() => isActive)()) {
    //     console.log("active changed")
    //     // classes.push("bg-gray-200 dark:bg-gray-800")
    // }
</script>


<li class="my-2 mr-2">
    <a {href} {title} class="px-3 py-2 text-base nav-item hover:bg-gray-400 hover:dark:bg-gray-600 rounded-md {classes.join(" ")} {page.url.pathname == href ? "bg-gray-200 dark:bg-gray-800" : ""}">{text}</a>
</li>
