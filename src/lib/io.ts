import { 
    exists as _exists, 
    copyFile as _copyFile, 
    create as _createFile, 
    readTextFile as _readTextFile, 
    writeTextFile as _writeTextFile,
    readDir as _readDir,
    remove as _removeFileOrDir,
    FileHandle as _FileHandle,
    mkdir as _mkdir,
    lstat as _lstat
} from '@tauri-apps/plugin-fs';
import { open as _openFileDirPicker } from '@tauri-apps/plugin-dialog';
import {
    join as _join,
    extname as _extname,
    basename as _basename,
    sep as _sep
} from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';


export const rawJoinPath = _join;
export const rawPathExists = _exists;
export const rawWriteTextFile = _writeTextFile;

/** Copy the directory from the given raw string path source to the destination. */
export async function rawCopyDir(fromPath: string, toPath: string): Promise<String> {
    // Call the `copy_directory` Rust function.
    return invoke(
        "copy_directory",
        { source: fromPath, destination: toPath }
    );
}


/**
 * Tauri-focussed Path class, similiar to Python's `pathlib`. In this implementation, all paths are either:
 * - relative to the user's Documents folder, or
 * - relative to another folder within the user's Documents folder.
 */
export class Path {
    // public static readonly BASE_PATH = {
    //     enum: _BaseDirectory.Document,
    //     dir: () => (_documentDir()),
    // };

    /** Each directory and folder in the path, relative to BASE_DIR. */
    private basePathParts: string[];
    private pathParts: string[];

    constructor(strPathParts: string[] | String, basePath?: Path | string) {
        // const baseParts: string[] = basePath?.pathParts() ?? [];
        if (basePath instanceof Path) {
            this.basePathParts = basePath?.pathParts ?? [];
        } else {
            this.basePathParts = basePath?.split(_sep()) ?? [];
        }

        if (strPathParts instanceof String) {
            this.pathParts = strPathParts.split(_sep());
        } else {
            this.pathParts = strPathParts;
        }
    }

    // public pathParts(): string[] {
    //     return this._pathParts;
    // }

    /** The absolute path of this Path. */
    public async absolute(): Promise<string> {
        return _join(
            ...this.basePathParts,
            ...this.pathParts
        );
    }

    /** Return the path relative to the base directory given at initialization. */
    public async relativePath(): Promise<string> {
        return _join(...this.pathParts);
    }

    /** Checks if this path exists. */
    public async exists(): Promise<boolean> {
        return _exists(await this.absolute())
    }

    /** Join the given string path parts to this Path's path and return the new path. */
    public async join(...strPathParts: string[]): Promise<Path> {
        const joined = await _join(...this.pathParts, ...strPathParts)
        return new Path(joined.split(_sep()))
    }


    //
    // ===  FILE and DIRECTORY CREATION AND MANIPULATION  == //
    //

    /** Create a file at the given path. */
    public async touch(existOk = true) {
        if (await this.exists() && !existOk) {
            return Promise.reject("The file at this path already exists. Set `existOk` to `true` to ignore this.")
        }

        return _createFile(await this.absolute())
    }

    /** Create a directory at the given path. If the directory already exists, the promise will be rejected (overrideable with `existOk = true`). */
    public async mkdir(existOk = false, recursive = true) {
        if (await this.exists() && !existOk) {
            return Promise.reject("The path must not exist to create a directory there. Set `existOk` to `true` to ignore this.")
        }

        return _mkdir(await this.absolute(), { recursive })
    }

    /** Remove the file or directory at the given path. If the directory is not empty and the recursive option isn't set to true, the promise will be rejected. */
    public async remove(missingOk = false, recursive = false) {
        if (!await this.exists() && !missingOk) {
            return Promise.reject("The file or directory does not exist. Set `missingOk` to `true` to ignore this.");
        }

        return _removeFileOrDir(await this.relativePath(), { recursive })
    }
    
    /** This this path a directory? */
    public async isDir(): Promise<boolean> {
        const stats = await _lstat(await this.relativePath());
        return stats.isDirectory;
    }

    /** Is this path a file? */
    public async isFile(): Promise<boolean> {
        return !this.isDir();
    }

    public async basename() {
        return _basename(await this.absolute());
    }

    public async extension() {
        return _extname(this.pathParts[-1]);
    }

    /** Reads the directory given by path and returns an array of `DirEntry`. */
    public async readDir() {
        return _readDir(await this.absolute());
    }
}
