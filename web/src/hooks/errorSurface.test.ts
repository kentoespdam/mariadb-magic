import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { classifyError } from "../lib/errorSurface";
import { useFormError } from "./useFormError";
import type { ApiError } from "../lib/apiClient.types";

describe("classifyError", () => {
  it("maps VALIDATION_FAILED with fields to field layer", () => {
    const err = {
      code: "VALIDATION_FAILED",
      message: "Validation failed",
      details: { fields: { name: "Required" } },
      status: 400,
    } as ApiError;
    expect(classifyError(err)).toBe("field");
  });

  it("maps VALIDATION_FAILED without fields to form layer", () => {
    const err = {
      code: "VALIDATION_FAILED",
      message: "Bad input",
      details: null,
      status: 400,
    } as ApiError;
    expect(classifyError(err)).toBe("form");
  });

  it("maps CONFLICT_RUNNING_SESSION to blocking layer", () => {
    const err = {
      code: "CONFLICT_RUNNING_SESSION",
      message: "Cannot delete",
      details: null,
      status: 409,
    } as ApiError;
    expect(classifyError(err)).toBe("blocking");
  });

  it("maps 5xx errors to page layer", () => {
    const err = {
      code: "INTERNAL",
      message: "Server error",
      details: null,
      status: 500,
    } as ApiError;
    expect(classifyError(err)).toBe("page");
  });

  it("maps NOT_FOUND to page layer", () => {
    const err = {
      code: "NOT_FOUND",
      message: "Not found",
      details: null,
      status: 404,
    } as ApiError;
    expect(classifyError(err)).toBe("page");
  });

  it("maps generic error to background layer", () => {
    const err = {
      code: "UNKNOWN",
      message: "Something went wrong",
      details: null,
      status: 400,
    } as ApiError;
    expect(classifyError(err)).toBe("background");
  });
});

describe("useFormError", () => {
  it("sets field errors from ApiError with fields", () => {
    const setError = vi.fn();
    const clearErrors = vi.fn();
    const form = { setError, clearErrors } as any;

    const { result } = renderHook(() =>
      useFormError(form as unknown as Parameters<typeof useFormError>[0]),
    );

    const err = {
      code: "VALIDATION_FAILED",
      message: "Form invalid",
      details: { fields: { email: "Invalid email", name: "Required" } },
      status: 400,
    } as ApiError;

    result.current.apply(err);

    expect(setError).toHaveBeenCalledWith("email", {
      message: "Invalid email",
    });
    expect(setError).toHaveBeenCalledWith("name", { message: "Required" });
  });

  it("sets banner when no fields in details", () => {
    const setError = vi.fn();
    const clearErrors = vi.fn();
    const form = { setError, clearErrors } as any;

    const { result } = renderHook(() =>
      useFormError(form as unknown as Parameters<typeof useFormError>[0]),
    );

    const err = {
      code: "VALIDATION_FAILED",
      message: "Form is invalid",
      details: null,
      status: 400,
    } as ApiError;

    act(() => {
      result.current.apply(err);
    });

    expect(result.current.banner).toBe("Form is invalid");
    expect(setError).not.toHaveBeenCalled();
  });

  it("clears errors on clear", () => {
    const setError = vi.fn();
    const clearErrors = vi.fn();
    const form = { setError, clearErrors } as any;

    const { result } = renderHook(() =>
      useFormError(form as unknown as Parameters<typeof useFormError>[0]),
    );

    result.current.clear();

    act(() => {
      void 0;
    });

    expect(clearErrors).toHaveBeenCalled();
    expect(result.current.banner).toBeNull();
  });
});
