import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useLocalStorageState from "../hooks/useLocalStorageState";

beforeEach(() => {
  localStorage.clear();
});

describe("useLocalStorageState", () => {
  it("reads the stored value when available", () => {
    localStorage.setItem("cdh-test", JSON.stringify("stored"));

    const { result } = renderHook(() =>
      useLocalStorageState("cdh-test", "default")
    );

    expect(result.current[0]).toBe("stored");
  });

  it("persists updates and supports reset", () => {
    const { result } = renderHook(() =>
      useLocalStorageState("cdh-test", 0)
    );

    act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
    expect(localStorage.getItem("cdh-test")).toBe("5");

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(0);
    expect(localStorage.getItem("cdh-test")).toBeNull();
  });

  it("falls back to the initial value when JSON is invalid", () => {
    localStorage.setItem("cdh-test", "{not-valid");

    const { result } = renderHook(() =>
      useLocalStorageState("cdh-test", "fallback")
    );

    expect(result.current[0]).toBe("fallback");
  });
});
