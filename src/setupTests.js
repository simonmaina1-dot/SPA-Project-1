import "@testing-library/jest-dom";
import { vi } from "vitest";

// Provide a minimal Jest timer shim so Testing Library detects fake timers.
if (typeof globalThis.jest === "undefined") {
  globalThis.jest = {
    advanceTimersByTime: (ms) => vi.advanceTimersByTime(ms),
  };
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}

global.IntersectionObserver = MockIntersectionObserver;
