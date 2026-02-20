/**
 * Tests for line ending handling
 * 
 * Verifies that parsers can handle both LF and CRLF line endings
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Line Ending Handling', () => {
  const testDir = path.join(__dirname, 'test-files');
  const lfFile = path.join(testDir, 'test-lf.txt');
  const crlfFile = path.join(testDir, 'test-crlf.txt');

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create test file with LF line endings
    fs.writeFileSync(lfFile, 'line1\nline2\nline3\n', { encoding: 'utf8' });

    // Create test file with CRLF line endings
    fs.writeFileSync(crlfFile, 'line1\r\nline2\r\nline3\r\n', { encoding: 'utf8' });
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(lfFile)) fs.unlinkSync(lfFile);
    if (fs.existsSync(crlfFile)) fs.unlinkSync(crlfFile);
    if (fs.existsSync(testDir)) fs.rmdirSync(testDir);
  });

  describe('File Reading', () => {
    it('should read LF file correctly', () => {
      const content = fs.readFileSync(lfFile, 'utf8');
      const lines = content.split(/\r?\n/).filter(line => line.length > 0);
      
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('line1');
      expect(lines[1]).toBe('line2');
      expect(lines[2]).toBe('line3');
    });

    it('should read CRLF file correctly', () => {
      const content = fs.readFileSync(crlfFile, 'utf8');
      const lines = content.split(/\r?\n/).filter(line => line.length > 0);
      
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('line1');
      expect(lines[1]).toBe('line2');
      expect(lines[2]).toBe('line3');
    });

    it('should handle both line endings with same regex', () => {
      const lfContent = fs.readFileSync(lfFile, 'utf8');
      const crlfContent = fs.readFileSync(crlfFile, 'utf8');
      
      const lfLines = lfContent.split(/\r?\n/).filter(line => line.length > 0);
      const crlfLines = crlfContent.split(/\r?\n/).filter(line => line.length > 0);
      
      expect(lfLines).toEqual(crlfLines);
    });
  });

  describe('JSON Parsing', () => {
    it('should parse JSON with LF line endings', () => {
      const jsonLF = '{\n  "key": "value",\n  "number": 42\n}';
      const parsed = JSON.parse(jsonLF);
      
      expect(parsed.key).toBe('value');
      expect(parsed.number).toBe(42);
    });

    it('should parse JSON with CRLF line endings', () => {
      const jsonCRLF = '{\r\n  "key": "value",\r\n  "number": 42\r\n}';
      const parsed = JSON.parse(jsonCRLF);
      
      expect(parsed.key).toBe('value');
      expect(parsed.number).toBe(42);
    });

    it('should parse JSON with mixed line endings', () => {
      const jsonMixed = '{\n  "key": "value",\r\n  "number": 42\n}';
      const parsed = JSON.parse(jsonMixed);
      
      expect(parsed.key).toBe('value');
      expect(parsed.number).toBe(42);
    });
  });

  describe('String Operations', () => {
    it('should normalize line endings to LF', () => {
      const crlfString = 'line1\r\nline2\r\nline3';
      const normalized = crlfString.replace(/\r\n/g, '\n');
      
      expect(normalized).toBe('line1\nline2\nline3');
      expect(normalized).not.toContain('\r');
    });

    it('should normalize line endings to CRLF', () => {
      const lfString = 'line1\nline2\nline3';
      const normalized = lfString.replace(/\n/g, '\r\n');
      
      expect(normalized).toBe('line1\r\nline2\r\nline3');
      const lines = normalized.split('\r\n').filter(line => line.length > 0);
      expect(lines).toHaveLength(3);
    });

    it('should handle platform-specific line endings', () => {
      const EOL = require('os').EOL;
      const text = `line1${EOL}line2${EOL}line3`;
      const lines = text.split(/\r?\n/).filter(line => line.length > 0);
      
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('line1');
    });
  });

  describe('Configuration File Parsing', () => {
    it('should parse .env file with LF', () => {
      const envContent = 'KEY1=value1\nKEY2=value2\nKEY3=value3';
      const lines = envContent.split(/\r?\n/);
      const config: Record<string, string> = {};
      
      lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          config[key] = value;
        }
      });
      
      expect(config.KEY1).toBe('value1');
      expect(config.KEY2).toBe('value2');
      expect(config.KEY3).toBe('value3');
    });

    it('should parse .env file with CRLF', () => {
      const envContent = 'KEY1=value1\r\nKEY2=value2\r\nKEY3=value3';
      const lines = envContent.split(/\r?\n/);
      const config: Record<string, string> = {};
      
      lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          config[key] = value;
        }
      });
      
      expect(config.KEY1).toBe('value1');
      expect(config.KEY2).toBe('value2');
      expect(config.KEY3).toBe('value3');
    });
  });
});
