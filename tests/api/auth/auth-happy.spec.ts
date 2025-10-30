import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";
import { APIHelper } from "../../../utils/api-helper";
import { Assertions } from "../../../utils/assertions";
import { SchemaValidator } from "../../../utils/schema-validator";
import loginSuccess from "../../../schema/auth/login-success.schema.json";

test.describe("Authentication Happy Path", () => {
  let api: APIHelper;

  test.beforeEach(async ({ request }) => {
    // Create a fresh APIHelper (uses your enhanced headers and retries)
    api = new APIHelper(request);

    // Allure meta for rich reporting
    await allure.epic("Authentication");
    await allure.feature("Login Happy Path");
  });

  test("POST - Successful login @smoke", async () => {
    await allure.story("Login with valid credentials");
    await allure.severity("blocker");
    await allure.tag("smoke");
    await allure.tag("auth");
    await allure.tag("login");

    // Valid ReqRes credentials
    const payload = {
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    };

    // Send POST (APIHelper ensures correct headers and data)
    const res = await api.post("https://reqres.in/api/login", payload);

    // Validate status code
    await api.validateResponse(res, 200);

    // Parse body using helper
    const body = await api.getResponseBody(res);

    // Reusable shape assertion (token must be present)
    Assertions.assertLoginSuccessShape(body);

    // Additional explicit check
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);

    console.log(`✅ Login token (first 10): ${body.token.substring(0, 10)}...`);
  });

  test("POST - Successful login with Valiator @smoke", async () => {
    const payload = { email: "eve.holt@reqres.in", password: "cityslicka" };
    const res = await api.post("https://reqres.in/api/login", payload);
    await api.validateResponse(res, 200);

    const body = await api.getResponseBody(res);
    // Contract validation
    SchemaValidator.validateOrThrow(loginSuccess, body, "Login Success");

    // Optional: extra bespoke checks
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);
  });
});
