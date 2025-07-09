import type { PageLoad } from "./$types";
import { ProjectManager as pm } from "$lib/project";

// export async function load({ params }) {
//     return await pm.listProjects();
// }
export const  load: PageLoad = async ({ params }) => {
    const projects = await pm.listProjects();
    return { projects: projects };
}