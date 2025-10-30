import { expect } from "@playwright/test";

export const Assertions = {
  assertUsersListShape(body: any) {
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body).toHaveProperty("page");
    expect(body).toHaveProperty("total");
  },

  assertSingleUserShape(body: any) {
    expect(body).toHaveProperty("data");
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("email");
    expect(body.data).toHaveProperty("first_name");
  },

  assertCreatedUserShape(body: any) {
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("job");
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("createdAt");
  },

  assertUpdatedUserShape(body: any) {
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("job");
    expect(body).toHaveProperty("updatedAt");
  },

  assertLoginSuccessShape(body: any) {
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);
  },

  assertLoginErrorShape(body: any) {
    expect(body).toHaveProperty("error");
    expect(typeof body.error).toBe("string");
    expect(body.error.length).toBeGreaterThan(0);
  },
};
