// Example usage of the ProjectManager and container format

import { ProjectManager, type Project, type Texture } from './project.js';

/**
 * Example: Creating a new project and adding textures
 */
export async function createNewProjectExample() {
    try {
        // Create a new project
        const container: Project = await ProjectManager.createProject("My Rack Project");
        
        console.log(`Created project: ${container.manifest.name}`);
        console.log(`Project ID: ${container.manifest.id}`);
        console.log(`Container path: ${container.path}`);
        
        return container;
    } catch (error) {
        console.error('Failed to create project:', error);
        return null;
    }
}

/**
 * Example: Opening an existing project
 */
export async function openExistingProjectExample(): Promise<Project | null> {
    try {
        const project = await ProjectManager.openProject(await ProjectManager.importProject());
        
        if (project) {
            console.log(`Opened project: ${project.manifest.name}`);
            console.log(`Number of textures: ${project.manifest.textures.length}`);
            
            // List all textures
            for (const texture of project.manifest.textures) {
                console.log(`- ${texture.originalName} (${texture.extension})`);
            }
        }
        
        return project;
    } catch (error) {
        console.error('Failed to open project:', error);
        return null;
    }
}

/**
 * Example: Adding a texture to a project
 */
export async function addTextureExample(project: Project): Promise<Texture | null> {
    try {
        const texture = await ProjectManager.addTexture(project);
        
        if (texture) {
            console.log(`Added texture: ${texture.originalName}`);
            console.log(`Texture ID: ${texture.id}`);
            console.log(`Relative path: ${await ProjectManager.getTexturePath(project, texture)}`);
            
            // Get the full path for display purposes
            const fullPath = await ProjectManager.getTexturePath(project, texture);
            console.log(`Full path: ${fullPath}`);
        }
        
        return texture;
    } catch (error) {
        console.error('Failed to add texture:', error);
        return null;
    }
}

/**
 * Example: Removing a texture from a project
 */
export async function removeTextureExample(container: Project, textureId: string): Promise<boolean> {
    try {
        const success = await ProjectManager.removeTexture(container, textureId);
        
        if (success) {
            console.log(`Successfully removed texture with ID: ${textureId}`);
        } else {
            console.log(`Failed to remove texture with ID: ${textureId}`);
        }
        
        return success;
    } catch (error) {
        console.error('Failed to remove texture:', error);
        return false;
    }
}

/**
 * Example: Listing all available projects
 */
export async function listProjectsExample(): Promise<void> {
    try {
        const projects = await ProjectManager.listProjects();
        
        console.log(`Found ${projects.length} projects:`);
        for (const project of projects) {
            console.log(`- ${project.manifest.name} (${project.path})`);
        }
    } catch (error) {
        console.error('Failed to list projects:', error);
    }
}

/**
 * Complete workflow example
 */
export async function completeWorkflowExample(): Promise<void> {
    console.log('=== Complete Project Workflow Example ===');
    
    // 1. List existing projects
    console.log('\n1. Listing existing projects...');
    await listProjectsExample();
    
    // 2. Create a new project
    console.log('\n2. Creating a new project...');
    const container = await createNewProjectExample();
    
    if (!container) {
        console.log('Failed to create project, stopping workflow');
        return;
    }
    
    // 3. Add some textures (this will open file dialogs)
    console.log('\n3. You can now add textures using the file picker...');
    console.log('Call addTextureExample(container) to open file picker');
    
    // 4. Display project info
    console.log('\n4. Project information:');
    console.log(`Name: ${container.manifest.name}`);
    console.log(`Version: ${container.manifest.version}`);
    console.log(`Rack Size: ${container.manifest.rackSize}`);
    console.log(`Created: ${container.manifest.createdAt}`);
    console.log(`Modified: ${container.manifest.modifiedAt}`);
    console.log(`Textures: ${container.manifest.textures.length}`);
}
