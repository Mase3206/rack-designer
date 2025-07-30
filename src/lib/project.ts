import { v7 as generateUuid } from "uuid";
import { 
//     exists, 
//     BaseDirectory, 
    copyFile, 
//     create, 
    readTextFile, 
//     writeTextFile,
//     readDir,
//     remove,
//     FileHandle,
//     mkdir
} from '@tauri-apps/plugin-fs';
import { open as openFilePicker } from '@tauri-apps/plugin-dialog';
// import { join, extname, basename, documentDir } from '@tauri-apps/api/path';
// import { join as joinPath } from "@tauri-apps/api/path";
// import { exists as pathExists } from "@tauri-apps/plugin-fs";

import {
    Path,
    rawJoinPath,
    rawPathExists,
    rawCopyDir,
    rawWriteTextFile,
} from "$lib/io";
import { documentDir, appLocalDataDir } from "@tauri-apps/api/path";
import { P } from "flowbite-svelte";





export interface Texture {
    /** UUID of the texture. */
    id: string;
    /** Original filename for display purposes */
    originalName: string;
    /** File extension */
    extension: string;
    /** File size in bytes */
    size?: number;
}



export interface Manifest {
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



export interface Project {
    /** Path to the project folder withn the user's documents folder. */
    path: Path;
    /** Project metadata */
    manifest: Manifest;
}


function sanitize(str: string) {
    return str.replace(/[^a-zA-Z0-9-_]/g, '_')
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
    private static _projectsFolder: Path | null = null;
    private static async getProjectsFolder(): Promise<Path> {
        if (!this._projectsFolder) {
            this._projectsFolder = new Path(["Rack Designer", "Projects"]);
        }
        return this._projectsFolder;
    }

    private static _localAppDataFolder: Path | null = null;
    private static async getLocalDataFolder(): Promise<Path> {
        if (!this._localAppDataFolder) {
            this._localAppDataFolder = new Path([]);
        }
        return this._localAppDataFolder;
    }

    /**
     * Creates a new project container
     */
    static async createProject(name: string): Promise<Project> {
        const projectId = generateUuid();
        const sanitizedName = sanitize(name);

        
        // Initialize project directory structure
        const projectPath = await (await ProjectManager.getProjectsFolder()).join(sanitizedName);
        const manifestPath = await (await ProjectManager.getProjectsFolder()).join("manifest.json")
        const assetsPath = await (await ProjectManager.getProjectsFolder()).join("assets");
        
        // Create parent directory for all projects if not present
        (await ProjectManager.getProjectsFolder()).mkdir(true, true);

        // Create project and asset folders & manifest file.
        projectPath.mkdir();
        assetsPath.mkdir();
        manifestPath.touch(false);
        
        // Create manifest
        const manifest: Manifest = {
            version: "1.0",
            name,
            id: projectId,
            rackSize: 42, // Default rack size
            textures: [],
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        };

        // Add it to a project
        const project: Project = { 
            path: projectPath,
            manifest,
        }
        
        // Save the project's manifest
        await this.saveManifest(project);

        return project;
    }
    

    /** Open project by folder name */
    static async openProject(folderName: string | Path): Promise<Project> {
        if (folderName instanceof Path) {
            const manifestPath = await folderName.join("manifest.json");
            if (!await manifestPath.exists()) {
                Promise.reject("The given project does not have a manifest folder and cannot be opened.")
            }
            const manifest: Manifest = JSON.parse(await readTextFile(await manifestPath.absolute()))
            const project: Project = { path: folderName, manifest }
            ProjectManager.setCurrentProject(project);
            return project;

        } else {
            const projectPath = await (await this.getProjectsFolder()).join(folderName)
            const manifestPath = await projectPath.join("manifest.json");
            if (!await manifestPath.exists()) {
                Promise.reject("The given project does not have a manifest folder and cannot be opened.")
            }
            const manifest: Manifest = JSON.parse(await readTextFile(await manifestPath.absolute()))
            const project: Project = { path: projectPath, manifest };
            ProjectManager.setCurrentProject(project);
            return project;
        }
    }


    /** Get the Project data of the currently-open project. */
    static async getCurrentProject(): Promise<Project> {
        const currentInfoPath = await (await ProjectManager.getLocalDataFolder()).join('current.json');
        const currentProject: Project = JSON.parse(await readTextFile(await currentInfoPath.absolute()))
        return currentProject;
    }


    /** Set the current Project. */
    private static async setCurrentProject(project: Project) {
        const currentInfoPath = await (await ProjectManager.getLocalDataFolder()).join('current.json');
        rawWriteTextFile(
            await currentInfoPath.absolute(),
            JSON.stringify(project, null, 4)
        );
    }


    /**
     * Imports an existing project via file select prompt.
     */
    static async importProject(): Promise<Path> {
        // const documentsPath = await documentDir();
        const selected = await openFilePicker({
            directory: true,
            defaultPath: await (await ProjectManager.getProjectsFolder()).absolute(),
            title: 'Select Project Folder'
        });
        
        if (!selected) { return Promise.reject("User closed file select prompt.") };
        
        // Use raw `join` and `exists` functions for this one thing.
        const projectPath = new Path(selected as string);
        const manifestPath = await (projectPath).join("manifest.json");
        
        if (!await manifestPath.exists()) {
            return Promise.reject('Invalid project folder: manifest.json not found');
        }
        
        const manifestContent = await readTextFile(await manifestPath.absolute());
        const manifest: Manifest = JSON.parse(manifestContent);
        
        // Copy the project into the Projects directory
        const pathFrom = selected;
        const pathTo = await (await ProjectManager.getProjectsFolder()).join(sanitize(manifest.name));

        await rawCopyDir(pathFrom, await pathTo.absolute());
        return projectPath;
    }


    /**
     * Adds a texture to the project by copying it to the assets folder
     */
    static async addTexture(project: Project): Promise<Texture | null> {
        const selected = await openFilePicker({
            multiple: false,
            filters: [{
                name: 'Images',
                extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg']
            }],
            title: 'Select Texture Image'
        });
        
        // Check if a file was actually selected.
        if (!selected) return null;
        const sourcePath = new Path(selected as string);

        // Make a new name for it
        const textureId = generateUuid();
        const destinationFilename = `texture_${textureId}${await sourcePath.extension()}`;
        
        // Copy file to project assets folder
        const destinationPath = await project.path.join('assets', destinationFilename);
        
        await copyFile(await sourcePath.absolute(), await destinationPath.absolute());
        
        // Create texture object
        const texture: Texture = {
            id: textureId,
            originalName: await sourcePath.basename(),
            extension: await sourcePath.extension(),
        };
        
        // Update manifest
        project.manifest.textures.push(texture);
        project.manifest.modifiedAt = new Date().toISOString();
        await this.saveManifest(project);
        
        return texture;
    }

    
    /**
     * Removes a texture from the project. Returns true if the texture was found and removed successfully.
     */
    static async removeTexture(project: Project, textureId: string): Promise<boolean> {
        // try {
        const textureIndex = project.manifest.textures.findIndex(t => t.id === textureId);
        if (textureIndex === -1) { return false };
        
        const texture = project.manifest.textures[textureIndex];
        
        // Remove file from assets folder
        const texturePath = await ProjectManager.getTexturePath(project, texture);
        
        try {
            // await remove(texturePath);
            await texturePath.remove();
        } catch (error) {
            console.error('Failed to remove texture file:', error);
            return false;
        }
        
        // Remove from manifest
        project.manifest.textures.splice(textureIndex, 1);
        project.manifest.modifiedAt = new Date().toISOString();
        await this.saveManifest(project);
        
        return true;
    }

    
    /**
     * Gets the full path to a texture file
     */
    static async getTexturePath(project: Project, texture: Texture): Promise<Path> {
        return await project.path.join('assets', `texture_${texture.id}${texture.extension}`);
    }

    
    /**
     * Saves the project manifest
     */
    private static async saveManifest(project: Project): Promise<void> {
        const manifestPath = await project.path.join("manifest.json")
        await rawWriteTextFile(
            await manifestPath.absolute(),
            JSON.stringify(project.manifest, null, 4)
        );
    }

    
    /**
     * Lists all available projects
     */
    static async listProjects(): Promise<Project[]> {
        const projectsPath = await ProjectManager.getProjectsFolder();
        
        if (!await projectsPath.exists()) { return [] };
        
        const entries = await projectsPath.readDir();
        if (entries.length == 0) { return [] };
        const projects: Project[] = [];
        
        for (const entry of entries) {
            if (entry.isDirectory) {
                // const manifestPath = await projectsPath.join(entry.name, "manifest.json");
                
                // if (await manifestPath.exists()) {
                //     const manifest: Manifest = JSON.parse(await readTextFile(await manifestPath.absolute()));
                //     projects.push({
                //         path: await projectsPath.join(entry.name),
                //         manifest
                //     });
                // }

                projects.push(await ProjectManager.openProject(entry.name));
            }
        }
        
        return projects;
    }
}
