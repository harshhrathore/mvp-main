/**
 * Tests for Windows-safe path handling utilities
 * 
 * These tests verify that path operations work correctly on Windows
 * with absolute paths like d:\Sama\{project}
 */

import * as path from 'path';

// Import the module - we'll use require since it's a .js file
const pathUtils = require('../../../scripts/utils/paths');

const {
  safePath,
  resolveAbsolute,
  normalizePath,
  getDirectory,
  getBaseName,
  getExtension,
  isAbsolute,
  toAbsolute,
  getRelativePath,
  toPlatformPath,
  toUnixPath,
  getWorkspaceRoot,
  getWorkspacePath,
} = pathUtils;

describe('Windows Path Handling Utilities', () => {
  describe('safePath', () => {
    it('should join path segments correctly', () => {
      const result = safePath('d:\\Sama', 'new_backend', 'src', 'index.ts');
      expect(result).toContain('new_backend');
      expect(result).toContain('src');
      expect(result).toContain('index.ts');
    });

    it('should handle mixed separators', () => {
      const result = safePath('d:/Sama', 'new_backend\\src', 'index.ts');
      expect(result).toContain('new_backend');
      expect(result).toContain('src');
    });
  });

  describe('resolveAbsolute', () => {
    it('should resolve to absolute path', () => {
      const result = resolveAbsolute('new_backend', 'src', 'index.ts');
      expect(path.isAbsolute(result)).toBe(true);
    });

    it('should handle Windows absolute paths', () => {
      const result = resolveAbsolute('d:\\Sama\\new_backend', 'src');
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toContain('new_backend');
    });
  });

  describe('normalizePath', () => {
    it('should normalize path with .. segments', () => {
      const result = normalizePath('d:/Sama/new_backend/../new_backend/src');
      expect(result).toContain('new_backend');
      expect(result).toContain('src');
      expect(result).not.toContain('..');
    });

    it('should handle . segments', () => {
      const result = normalizePath('./src/./index.ts');
      expect(result).not.toContain('./');
    });
  });

  describe('getDirectory', () => {
    it('should extract directory from path', () => {
      const result = getDirectory('d:\\Sama\\new_backend\\src\\index.ts');
      expect(result).toContain('src');
      expect(result).not.toContain('index.ts');
    });
  });

  describe('getBaseName', () => {
    it('should extract file name from path', () => {
      const result = getBaseName('d:\\Sama\\new_backend\\src\\index.ts');
      expect(result).toBe('index.ts');
    });

    it('should remove extension when provided', () => {
      const result = getBaseName('d:\\Sama\\new_backend\\src\\index.ts', '.ts');
      expect(result).toBe('index');
    });
  });

  describe('getExtension', () => {
    it('should extract extension from path', () => {
      const result = getExtension('d:\\Sama\\new_backend\\src\\index.ts');
      expect(result).toBe('.ts');
    });

    it('should return empty string for no extension', () => {
      const result = getExtension('d:\\Sama\\new_backend\\README');
      expect(result).toBe('');
    });
  });

  describe('isAbsolute', () => {
    it('should detect Windows absolute paths', () => {
      expect(isAbsolute('d:\\Sama\\new_backend')).toBe(true);
      expect(isAbsolute('C:\\Users\\test')).toBe(true);
    });

    it('should detect relative paths', () => {
      expect(isAbsolute('src\\index.ts')).toBe(false);
      expect(isAbsolute('./src/index.ts')).toBe(false);
    });

    it('should detect Unix absolute paths', () => {
      expect(isAbsolute('/home/user/project')).toBe(true);
    });
  });

  describe('toAbsolute', () => {
    it('should convert relative to absolute', () => {
      const result = toAbsolute('d:\\Sama\\new_backend', 'src\\index.ts');
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toContain('new_backend');
      expect(result).toContain('src');
    });

    it('should return absolute path unchanged', () => {
      const absolutePath = 'd:\\Sama\\new_backend\\src';
      const result = toAbsolute('d:\\Sama', absolutePath);
      expect(result).toBe(absolutePath);
    });
  });

  describe('getRelativePath', () => {
    it('should compute relative path between directories', () => {
      const from = 'd:\\Sama\\new_backend\\src';
      const to = 'd:\\Sama\\frontend\\src';
      const result = getRelativePath(from, to);
      expect(result).toContain('frontend');
    });
  });

  describe('toPlatformPath', () => {
    it('should convert forward slashes on Windows', () => {
      const input = 'd:/Sama/new_backend/src';
      const result = toPlatformPath(input);
      
      if (path.sep === '\\') {
        expect(result).toBe('d:\\Sama\\new_backend\\src');
      } else {
        expect(result).toBe(input);
      }
    });
  });

  describe('toUnixPath', () => {
    it('should convert backslashes to forward slashes', () => {
      const result = toUnixPath('d:\\Sama\\new_backend\\src');
      expect(result).toBe('d:/Sama/new_backend/src');
    });

    it('should handle already Unix-style paths', () => {
      const input = 'd:/Sama/new_backend/src';
      const result = toUnixPath(input);
      expect(result).toBe(input);
    });
  });

  describe('getWorkspaceRoot', () => {
    it('should return absolute path', () => {
      const result = getWorkspaceRoot();
      expect(path.isAbsolute(result)).toBe(true);
    });

    it('should point to workspace root', () => {
      const result = getWorkspaceRoot();
      // Should be two levels up from scripts/utils
      expect(result).not.toContain('scripts');
      expect(result).not.toContain('utils');
    });
  });

  describe('getWorkspacePath', () => {
    it('should return path to workspace folder', () => {
      const result = getWorkspacePath('new_backend');
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toContain('new_backend');
    });

    it('should handle multiple workspace folders', () => {
      const backend = getWorkspacePath('new_backend');
      const frontend = getWorkspacePath('frontend');
      
      expect(backend).toContain('new_backend');
      expect(frontend).toContain('frontend');
      expect(backend).not.toBe(frontend);
    });
  });

  describe('Windows absolute path integration', () => {
    it('should handle d:\\Sama\\new_backend paths', () => {
      const basePath = 'd:\\Sama\\new_backend';
      const srcPath = safePath(basePath, 'src', 'index.ts');
      
      expect(srcPath).toContain('new_backend');
      expect(srcPath).toContain('src');
      expect(srcPath).toContain('index.ts');
    });

    it('should handle d:\\Sama\\frontend paths', () => {
      const basePath = 'd:\\Sama\\frontend';
      const srcPath = safePath(basePath, 'src', 'App.tsx');
      
      expect(srcPath).toContain('frontend');
      expect(srcPath).toContain('src');
      expect(srcPath).toContain('App.tsx');
    });

    it('should handle d:\\Sama\\checkin-chat paths', () => {
      const basePath = 'd:\\Sama\\checkin-chat';
      const appPath = safePath(basePath, 'files', 'app', 'main.py');
      
      expect(appPath).toContain('checkin-chat');
      expect(appPath).toContain('files');
      expect(appPath).toContain('app');
      expect(appPath).toContain('main.py');
    });

    it('should handle d:\\Sama\\checkin-voice paths', () => {
      const basePath = 'd:\\Sama\\checkin-voice';
      const mainPath = safePath(basePath, 'sama-voice-agentcode', 'local-voice-ai-agent', 'main.py');
      
      expect(mainPath).toContain('checkin-voice');
      expect(mainPath).toContain('sama-voice-agentcode');
      expect(mainPath).toContain('local-voice-ai-agent');
      expect(mainPath).toContain('main.py');
    });
  });
});
