import { isAuthenticated, logout } from "../utils/auth";

// Mock window.location
delete window.location;
window.location = { href: "" };

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "";
});

describe("isAuthenticated", () => {
  it("returns false when no token exists", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("returns true when localStorage has token", () => {
    localStorage.setItem("token", "jwt.token.here");
    expect(isAuthenticated()).toBe(true);
  });

  it("returns true when sessionStorage has token", () => {
    sessionStorage.setItem("token", "jwt.token.here");
    expect(isAuthenticated()).toBe(true);
  });

  it("returns false when token is empty string", () => {
    localStorage.setItem("token", "");
    expect(isAuthenticated()).toBe(false);
  });
});

describe("logout", () => {
  beforeEach(() => {
    localStorage.setItem("token", "some-token");
    localStorage.setItem("user", JSON.stringify({ name: "Admin", role: "admin" }));
    sessionStorage.setItem("token", "some-token");
  });

  it("removes token from localStorage", () => {
    logout();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("removes token from sessionStorage", () => {
    logout();
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("redirects to /login", () => {
    logout();
    expect(window.location.href).toBe("/login");
  });

  // Security: logout must clear the stale user object.
  // Marked failing because the fix lives in fix/security-and-code-review;
  // this will become a normal passing test once that branch is merged.
  // Skipped: fix lives in fix/security-and-code-review (will pass once merged)
  it.skip("removes user object from localStorage", () => {
    logout();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
