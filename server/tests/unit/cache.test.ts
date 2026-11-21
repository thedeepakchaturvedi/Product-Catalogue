import { describe, it, expect, beforeEach } from "vitest";
import { Cache } from "../../src/providers/cache.js";

describe("Cache", () => {
  let cache: Cache;

  beforeEach(() => {
    cache = new Cache();
  });

  it("returns null for non-existent key", () => {
    expect(cache.get("missing")).toBeNull();
  });

  it("sets and retrieves cached value within TTL", () => {
    cache.set("foo", { data: 123 }, 5000);
    expect(cache.get("foo")).toEqual({ data: 123 });
  });

  it("returns null after TTL expiration", async () => {
    cache.set("short_lived", "hello", 10);
    expect(cache.get("short_lived")).toBe("hello");

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(cache.get("short_lived")).toBeNull();
  });

  it("deletes a key correctly", () => {
    cache.set("to_delete", "val", 5000);
    expect(cache.delete("to_delete")).toBe(true);
    expect(cache.get("to_delete")).toBeNull();
  });

  it("clears all keys", () => {
    cache.set("k1", 1, 5000);
    cache.set("k2", 2, 5000);
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get("k1")).toBeNull();
    expect(cache.get("k2")).toBeNull();
  });
});
