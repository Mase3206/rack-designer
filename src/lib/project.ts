import { v7 as generateUuid } from "uuid";
import { 
    exists, 
    BaseDirectory, 
    copyFile, 
    create, 
    readTextFile, 
    writeTextFile,
    readDir,
    remove
} from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
import { join, extname, basename, documentDir } from '@tauri-apps/api/path';



export interface Texture {
    id: string;
    /** Relative path within the project container (e.g., "assets/texture_123.png") */
    path: string;
    /** Original filename for display purposes */
    originalName: string;
    /** File extension */
    extension: string;
    /** File size in bytes */
    size?: number;
}



export interface ProjectFile {
    /** Version of the project file format */
    version: "1.0";
    /** Name of the project */
    name: string;
    /** Unique project ID */
    id: string;
    /** Rack size configuration */
    rackSize: number;
    /** List of textures used in the project */
    textures: Texture[];
    /** Creation timestamp */
    createdAt: string;
    /** Last modified timestamp */
    modifiedAt: string;
}



export interface ProjectContainer {
    /** Path to the project folder */
    containerPath: string;
    /** Project metadata */
    manifest: ProjectFile;
}



/** 
 * Project container structure:
 * ```txt
 * project-name/
 *   ├── manifest.json (ProjectFile)
 *   └── assets/
 *       ├── texture_uuid1.png
 *       ├── texture_uuid2.jpg
 *       └── ...
 * ```
 */
export class ProjectManager {
    private static readonly MANIFEST_FILENAME = 'manifest.json';
    private static readonly ASSETS_FOLDER = 'assets';
    

    /**
     * Creates a new project container
     */
    static async createProject(name: string): Promise<ProjectContainer> {
        const projectId = generateUuid();
        const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
        const containerPath = await join('RackDesigner', 'Projects', sanitizedName);
        
        // Create project directory structure
        const documentsPath = await documentDir();
        const fullContainerPath = await join(documentsPath, containerPath);
        const assetsPath = await join(fullContainerPath, this.ASSETS_FOLDER);
        
        // Create directories
        try {
            await create(fullContainerPath);
        } catch (error) {
            // Directory might already exist, that's okay
        }
        
        try {
            await create(assetsPath);
        } catch (error) {
            // Directory might already exist, that's okay
        }
        
        // Create manifest
        const manifest: ProjectFile = {
            version: "1.0",
            name,
            id: projectId,
            rackSize: 42, // Default rack size
            textures: [],
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        };
        
        // Save manifest
        await this.saveManifest(containerPath, manifest);
        
        return { containerPath, manifest };
    }
    

    /**
     * Opens an existing project
     */
    static async openProject(): Promise<ProjectContainer | null> {
        const documentsPath = await documentDir();
        const selected = await open({
            directory: true,
            defaultPath: await join(documentsPath, 'RackDesigner', 'Projects'),
            title: 'Select Project Folder'
        });
        
        if (!selected) return null;
        
        try {
            const manifestPath = await join(selected as string, this.MANIFEST_FILENAME);
            const manifestExists = await exists(manifestPath);
            
            if (!manifestExists) {
                throw new Error('Invalid project folder: manifest.json not found');
            }
            
            const manifestContent = await readTextFile(manifestPath);
            const manifest: ProjectFile = JSON.parse(manifestContent);
            
            // Convert absolute path to relative path from Documents
            const containerPath = (selected as string).replace(documentsPath + '/', '');
            
            return { containerPath, manifest };
        } catch (error) {
            console.error('Failed to open project:', error);
            return null;
        }
    }

    
    /**
     * Adds a texture to the project by copying it to the assets folder
     */
    static async addTexture(container: ProjectContainer): Promise<Texture | null> {
        const selected = await open({
            multiple: false,
            filters: [{
                name: 'Images',
                extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg']
            }],
            title: 'Select Texture Image'
        });
        
        if (!selected) return null;
        
        try {
            const sourcePath = selected as string;
            const originalName = await basename(sourcePath);
            const extension = await extname(sourcePath);
            const textureId = generateUuid();
            const destinationFilename = `texture_${textureId}${extension}`;
            
            // Copy file to project assets folder
            const documentsPath = await documentDir();
            const fullContainerPath = await join(
                documentsPath,
                container.containerPath
            );
            const destinationPath = await join(
                fullContainerPath,
                this.ASSETS_FOLDER,
                destinationFilename
            );
            
            await copyFile(sourcePath, destinationPath);
            
            // Create texture object
            const texture: Texture = {
                id: textureId,
                path: await join(this.ASSETS_FOLDER, destinationFilename),
                originalName,
                extension
            };
            
            // Update manifest
            container.manifest.textures.push(texture);
            container.manifest.modifiedAt = new Date().toISOString();
            await this.saveManifest(container.containerPath, container.manifest);
            
            return texture;
        } catch (error) {
            console.error('Failed to add texture:', error);
            return null;
        }
    }

    
    /**
     * Removes a texture from the project
     */
    static async removeTexture(container: ProjectContainer, textureId: string): Promise<boolean> {
        try {
            const textureIndex = container.manifest.textures.findIndex(t => t.id === textureId);
            if (textureIndex === -1) return false;
            
            const texture = container.manifest.textures[textureIndex];
            
            // Remove file from assets folder
            const documentsPath = await documentDir();
            const fullContainerPath = await join(
                documentsPath,
                container.containerPath
            );
            const texturePath = await join(fullContainerPath, texture.path);
            
            try {
                await remove(texturePath);
            } catch (error) {
                console.warn('Failed to remove texture file:', error);
            }
            
            // Remove from manifest
            container.manifest.textures.splice(textureIndex, 1);
            container.manifest.modifiedAt = new Date().toISOString();
            await this.saveManifest(container.containerPath, container.manifest);
            
            return true;
        } catch (error) {
            console.error('Failed to remove texture:', error);
            return false;
        }
    }

    
    /**
     * Gets the full path to a texture file
     */
    static async getTexturePath(container: ProjectContainer, texture: Texture): Promise<string> {
        const documentsPath = await documentDir();
        const fullContainerPath = await join(
            documentsPath,
            container.containerPath
        );
        return await join(fullContainerPath, texture.path);
    }

    
    /**
     * Saves the project manifest
     */
    private static async saveManifest(containerPath: string, manifest: ProjectFile): Promise<void> {
        const documentsPath = await documentDir();
        const fullContainerPath = await join(
            documentsPath,
            containerPath
        );
        const manifestPath = await join(fullContainerPath, this.MANIFEST_FILENAME);
        await writeTextFile(manifestPath, JSON.stringify(manifest, null, 2));
    }

    
    /**
     * Lists all available projects
     */
    static async listProjects(): Promise<{ name: string; path: string; }[]> {
        try {
            const documentsPath = await documentDir();
            const projectsPath = await join(
                documentsPath,
                'RackDesigner',
                'Projects'
            );
            
            const projectsExist = await exists(projectsPath);
            if (!projectsExist) return [];
            
            const entries = await readDir(projectsPath);
            const projects: { name: string; path: string; }[] = [];
            
            for (const entry of entries) {
                if (entry.isDirectory) {
                    const manifestPath = await join(projectsPath, entry.name, this.MANIFEST_FILENAME);
                    const manifestExists = await exists(manifestPath);
                    
                    if (manifestExists) {
                        projects.push({
                            name: entry.name,
                            path: await join('RackDesigner', 'Projects', entry.name)
                        });
                    }
                }
            }
            
            return projects;
        } catch (error) {
            console.error('Failed to list projects:', error);
            return [];
        }
    }
}
