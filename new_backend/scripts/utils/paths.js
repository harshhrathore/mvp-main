/**
 * Windows-safe path handling utilities
 * 
 * This module provides cross-platform path operations that work correctly
 * on Windows (with backslashes and drive letters) and Unix-like systems.
 */

const path = require('path');

/**
 * Safely join path segments using the platform-specific separator
 * @param {...string} segments - Path segments to join
 * @returns {string} Joined path
 * 
 * @example
 * // On Windows: 'd:\\Sama\\new_backend\\src\\index.ts'
 * // On Unix: '/home/user/new_backend/src/index.ts'
 * safePath('d:\\Sama\\new_backend', 'src', 'index.ts')
 */
function safePath(...segments) {
  return path.join(...segments);
}

/**
 * Resolve a sequence of paths into an absolute path
 * @param {...string} segments - Path segments to resolve
 * @returns {string} Absolute path
 * 
 * @example
 * // On Windows: 'd:\\Sama\\new_backend\\src\\index.ts'
 * resolveAbsolute('d:\\Sama\\new_backend', 'src', 'index.ts')
 */
function resolveAbsolute(...segments) {
  return path.resolve(...segments);
}

/**
 * Normalize a path, resolving '..' and '.' segments
 * Handles both forward and backward slashes
 * @param {string} pathStr - Path to normalize
 * @returns {string} Normalized path
 * 
 * @example
 * // On Windows: 'd:\\Sama\\new_backend\\src'
 * normalizePath('d:/Sama/new_backend/../new_backend/src')
 */
function normalizePath(pathStr) {
  return path.normalize(pathStr);
}

/**
 * Get the directory name of a path
 * @param {string} pathStr - Path to get directory from
 * @returns {string} Directory path
 * 
 * @example
 * // Returns: 'd:\\Sama\\new_backend'
 * getDirectory('d:\\Sama\\new_backend\\src\\index.ts')
 */
function getDirectory(pathStr) {
  return path.dirname(pathStr);
}

/**
 * Get the base name (file name) of a path
 * @param {string} pathStr - Path to get base name from
 * @param {string} [ext] - Optional extension to remove
 * @returns {string} Base name
 * 
 * @example
 * // Returns: 'index.ts'
 * getBaseName('d:\\Sama\\new_backend\\src\\index.ts')
 * 
 * // Returns: 'index'
 * getBaseName('d:\\Sama\\new_backend\\src\\index.ts', '.ts')
 */
function getBaseName(pathStr, ext) {
  return path.basename(pathStr, ext);
}

/**
 * Get the extension of a path
 * @param {string} pathStr - Path to get extension from
 * @returns {string} Extension including the dot
 * 
 * @example
 * // Returns: '.ts'
 * getExtension('d:\\Sama\\new_backend\\src\\index.ts')
 */
function getExtension(pathStr) {
  return path.extname(pathStr);
}

/**
 * Check if a path is absolute
 * Works with Windows drive letters (C:\, d:\) and Unix absolute paths (/)
 * @param {string} pathStr - Path to check
 * @returns {boolean} True if path is absolute
 * 
 * @example
 * // Returns: true
 * isAbsolute('d:\\Sama\\new_backend')
 * 
 * // Returns: false
 * isAbsolute('src\\index.ts')
 */
function isAbsolute(pathStr) {
  return path.isAbsolute(pathStr);
}

/**
 * Convert a relative path to absolute based on a base directory
 * @param {string} basePath - Base directory path
 * @param {string} relativePath - Relative path to convert
 * @returns {string} Absolute path
 * 
 * @example
 * // Returns: 'd:\\Sama\\new_backend\\src\\index.ts'
 * toAbsolute('d:\\Sama\\new_backend', 'src\\index.ts')
 */
function toAbsolute(basePath, relativePath) {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.resolve(basePath, relativePath);
}

/**
 * Get a relative path from one path to another
 * @param {string} from - Source path
 * @param {string} to - Target path
 * @returns {string} Relative path
 * 
 * @example
 * // Returns: '..\\..\\frontend\\src'
 * getRelativePath('d:\\Sama\\new_backend\\src', 'd:\\Sama\\frontend\\src')
 */
function getRelativePath(from, to) {
  return path.relative(from, to);
}

/**
 * Convert forward slashes to platform-specific separators
 * Useful for converting Unix-style paths to Windows paths
 * @param {string} pathStr - Path with forward slashes
 * @returns {string} Path with platform-specific separators
 * 
 * @example
 * // On Windows: 'd:\\Sama\\new_backend\\src'
 * // On Unix: 'd:/Sama/new_backend/src' (unchanged)
 * toPlatformPath('d:/Sama/new_backend/src')
 */
function toPlatformPath(pathStr) {
  if (path.sep === '\\') {
    return pathStr.replace(/\//g, '\\');
  }
  return pathStr;
}

/**
 * Convert backslashes to forward slashes
 * Useful for URLs or cross-platform path storage
 * @param {string} pathStr - Path with backslashes
 * @returns {string} Path with forward slashes
 * 
 * @example
 * // Returns: 'd:/Sama/new_backend/src'
 * toUnixPath('d:\\Sama\\new_backend\\src')
 */
function toUnixPath(pathStr) {
  return pathStr.replace(/\\/g, '/');
}

/**
 * Get the workspace root directory
 * Assumes this script is in scripts/utils/ relative to workspace root
 * @returns {string} Absolute path to workspace root
 */
function getWorkspaceRoot() {
  // This file is at scripts/utils/paths.js
  // Go up two levels to reach workspace root
  return path.resolve(__dirname, '..', '..');
}

/**
 * Get path to a specific workspace folder
 * @param {string} folderName - Name of workspace folder (e.g., 'new_backend', 'frontend')
 * @returns {string} Absolute path to workspace folder
 * 
 * @example
 * // Returns: 'd:\\Sama\\new_backend'
 * getWorkspacePath('new_backend')
 */
function getWorkspacePath(folderName) {
  return path.join(getWorkspaceRoot(), folderName);
}

module.exports = {
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
  
  // Export path module constants for convenience
  sep: path.sep,
  delimiter: path.delimiter,
};
