import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

global.expect = expect;

// Cleanup after each test
afterEach(() => {
  cleanup();
});