import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";
import { APIHelper } from "../../../utils/api-helper";

test.describe("Authentication Tests", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
    await allure.epic("Authentication");
    await allure.feature("User Login");
  });

  test("POST - Successful login @smoke", async () => {
    await allure.story("User login with valid credentials");
    await allure.severity("blocker");
    await allure.tag("smoke");
    await allure.tag("auth");
    await allure.tag("login");
    await allure.tag("positive");

    const loginData = {
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    };

    const response = await apiHelper.post(
      "https://reqres.in/api/login",
      loginData
    );
    await apiHelper.validateResponse(response, 200);

    const responseData = await apiHelper.getResponseBody<{ token: string }>(
      response
    );

    // ✅ Store token in helper so all future requests are authenticated
    apiHelper.setAuthToken(responseData.token);

    expect(responseData).toHaveProperty("token");
    expect(typeof responseData.token).toBe("string");
    expect(responseData.token.length).toBeGreaterThan(0);

    console.log(
      `Login successful. Token: ${responseData.token.substring(0, 10)}...`
    );
  });

  test("POST - Login failure without password @smoke", async () => {
    await allure.story("Login fails without password");
    await allure.severity("critical");
    await allure.tag("smoke");
    await allure.tag("auth");
    await allure.tag("login");
    await allure.tag("positive");

    const loginData = {
      email: "eve.holt@reqres.in",
      // Missing password intentionally
    };

    const response = await apiHelper.post(
      "https://reqres.in/api/login",
      loginData
    );
    await apiHelper.validateResponse(response, 400);

    const responseData = await apiHelper.getResponseBody<{ error: string }>(
      response
    );
    expect(responseData).toHaveProperty("error");
    expect(responseData.error).toBe("Missing password");

    console.log(`Error handled correctly: ${responseData.error}`);
  });

  test("POST - Register new user @smoke", async () => {
    await allure.story("User registration");
    await allure.severity("critical");
    await allure.tag("smoke");
    await allure.tag("auth");
    await allure.tag("register");

    const registerData = {
      email: "eve.holt@reqres.in",
      password: "pistol",
    };

    const response = await apiHelper.post(
      "https://reqres.in/api/register",
      registerData
    );
    await apiHelper.validateResponse(response, 200);

    const responseData = await apiHelper.getResponseBody<{
      id: number;
      token: string;
    }>(response);

    expect(responseData).toHaveProperty("id");
    expect(responseData).toHaveProperty("token");

    console.log(`Registration successful. User ID: ${responseData.id}`);
  });
});
