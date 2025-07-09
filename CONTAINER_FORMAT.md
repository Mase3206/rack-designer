# Project Container Format

This document describes the container format used for storing rack designer projects with embedded texture assets.

## Overview

The container format is a folder-based structure that includes:
- A JSON manifest file containing project metadata
- An assets folder containing all texture files
- Relative path references to maintain portability

## Container Structure

```
project-name/
├── manifest.json          # Project metadata and configuration
└── assets/                # Texture assets folder
    ├── texture_uuid1.png  # Texture files with UUID-based names
    ├── texture_uuid2.jpg
    └── ...
```

## Manifest Format (`manifest.json`)

```typescript
interface ProjectFile {
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
```

## Texture Format

```typescript
interface Texture {
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
```

<!-- ## Key Features

### 1. **Portable Container Format**
- All project data is contained within a single folder
- Relative paths ensure the project can be moved between systems
- No external dependencies or absolute file references

### 2. **Asset Management**
- Textures are copied into the project container during import
- UUID-based filenames prevent naming conflicts
- Original filenames are preserved for display purposes

### 3. **File Organization**
- Projects are stored in `~/Documents/RackDesigner/Projects/`
- Each project gets its own folder with a sanitized name
- Assets are organized in a dedicated subfolder

### 4. **Version Control Friendly**
- JSON manifest with clean formatting
- Predictable file structure
- Binary assets separated from metadata -->

## API Usage

### Creating a New Project

```typescript
import { ProjectManager } from './io';

const container = await ProjectManager.createProject("My Project");
console.log(`Created project: ${container.manifest.name}`);
```

### Opening an Existing Project

```typescript
const container = await ProjectManager.openProject();
if (container) {
    console.log(`Opened: ${container.manifest.name}`);
}
```

### Adding Textures

```typescript
const texture = await ProjectManager.addTexture(container);
if (texture) {
    console.log(`Added: ${texture.originalName}`);
    console.log(`Path: ${texture.path}`);
}
```

### Getting Full Texture Path

```typescript
const fullPath = await ProjectManager.getTexturePath(container, texture);
// Use this path to load the texture in your application
```

### Removing Textures

```typescript
const success = await ProjectManager.removeTexture(container, texture.id);
```

### Listing Projects

```typescript
const projects = await ProjectManager.listProjects();
for (const project of projects) {
    console.log(`${project.name}: ${project.path}`);
}
```

## File Path Management

### Relative Paths
All texture paths in the manifest are relative to the project container root:
```
"path": "assets/texture_12345678-1234-5678-9abc-123456789abc.png"
```

### Absolute Paths for File Operations
When performing file operations, convert to absolute paths:
```typescript
const documentsPath = await documentDir();
const fullPath = await join(documentsPath, container.containerPath, texture.path);
```

### Cross-Platform Compatibility
- Uses Tauri's path utilities for cross-platform compatibility
- All path operations use proper separators for the target OS
- BaseDirectory.Document ensures consistent location across platforms

## Best Practices

### 1. **Error Handling**
Always wrap operations in try-catch blocks:
```typescript
try {
    const container = await ProjectManager.createProject("Test");
    // ... use container
} catch (error) {
    console.error('Project operation failed:', error);
}
```

### 2. **File Extension Validation**
The file picker is configured to accept common image formats:
- PNG, JPG, JPEG, GIF, BMP, WebP, SVG

### 3. **Unique Identifiers**
- Project IDs use UUID v7 for time-ordered uniqueness
- Texture IDs use UUID v7 for consistent identification
- Filename conflicts are impossible due to UUID-based naming

### 4. **Metadata Updates**
The manifest's `modifiedAt` timestamp is automatically updated when:
- Textures are added or removed
- Any changes are made to the project

## Technical Implementation

### File Operations
- Uses `@tauri-apps/plugin-fs` for secure file system access
- Uses `@tauri-apps/plugin-dialog` for file picker functionality
- All operations respect Tauri's security model

### Directory Creation
- Automatically creates necessary directory structure
- Handles existing directories gracefully
- Uses appropriate error handling for filesystem operations

### Asset Copying
- Files are copied (not moved) to preserve originals
- Atomic operations ensure data integrity
- Proper cleanup on operation failure

<!-- ## Future Enhancements

Potential improvements to consider:

1. **Compression**: Add ZIP-based container option for reduced size
2. **Versioning**: Support for project file format migrations
3. **Validation**: Schema validation for manifest files
4. **Backup**: Automatic backup functionality
5. **Import/Export**: Support for exporting to standard formats
6. **Thumbnails**: Generate preview thumbnails for textures
7. **Metadata**: Extended texture metadata (dimensions, color depth, etc.) -->
