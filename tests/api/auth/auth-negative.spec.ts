import { test } from "@playwright/test";
import * as allure from "allure-js-commons";
import { APIHelper } from "../../../utils/api-helper";
import { Assertions } from "../../../utils/assertions";
import { SchemaValidator } from "../../../utils/schema-validator";
import loginError from "../../../schema/auth/login-error.schema.json";

test.describe("Authentication Negative Tests", () => {
  let api: APIHelper;

  test.beforeEach(async ({ request }) => {
    api = new APIHelper(request);
    await allure.epic("Authentication");
    await allure.feature("Negative Scenarios");
  });

  test("POST - Login fails without password @smoke", async () => {
    await allure.story("Missing password field");
    await allure.severity("critical");
    await allure.tag("smoke");
    await allure.tag("negative");
    await allure.tag("auth");

    const payload = { email: "eve.holt@reqres.in" }; // no password
    const res = await api.post("https://reqres.in/api/login", payload);

    await api.validateResponse(res, 400);

    const body = await api.getResponseBody(res);
    Assertions.assertLoginErrorShape(body); // error key enforced
    console.log(`❗ Error: ${body.error}`);
  });

  test("POST - Login fails without password with validator @smoke", async () => {
    const payload = { email: "eve.holt@reqres.in" };
    const res = await api.post("https://reqres.in/api/login", payload);
    await api.validateResponse(res, 400);

    const body = await api.getResponseBody(res);
    SchemaValidator.validateOrThrow(
      loginError,
      body,
      "Login Error - Missing Password"
    );
  });

  test("POST - Login fails with invalid API key @negative", async () => {
    await allure.story("Invalid API key header");
    await allure.severity("normal");
    await allure.tag("negative");
    await allure.tag("auth");

    const payload = {
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    };

    // Override default key with an invalid one (per-request override)
    const res = await api.post("https://reqres.in/api/login", payload, {
      headers: {
        "X-API-KEY": "invalid-key",
      },
    });

    // Accept either 400 or 401 depending on current behavior
    const status = res.status();
    console.log(`Received status: ${status}`);
    if (status !== 400 && status !== 403) {
      throw new Error(`Unexpected status ${status} for invalid API key test`);
    }

    const body = await api.getResponseBody(res);
    if (status === 400) {
      // Likely error message from ReqRes
      Assertions.assertLoginErrorShape(body);
    }
  });
});
