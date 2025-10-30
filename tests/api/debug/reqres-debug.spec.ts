import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";
import { APIHelper } from "../../../utils/api-helper";

test.describe("ReqRes Debug Tests", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test("Debug login endpoint behavior", async () => {
    await allure.epic("Debug");
    await allure.feature("ReqRes API Changes");

    const loginData = {
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    };

    // Test different scenarios
    console.log("Testing login with API key...");

    try {
      const response = await apiHelper.post(
        "https://reqres.in/api/login",
        loginData,
        {
          headers: {
            "X-API-KEY": "reqres-free-v1",
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`Status: ${response.status()}`);
      const responseData = await apiHelper.getResponseBody(response);
      console.log("Response:", responseData);

      if (response.status() === 200) {
        expect(responseData).toHaveProperty("token");
        console.log("✅ Login works with API key");
      } else {
        console.log(`❌ Login failed with status: ${response.status()}`);
        console.log("Response body:", responseData);
      }
    } catch (error) {
      console.log("Error during login test:", error);
    }
  });

  test("Test user endpoints to verify API key works", async () => {
    await allure.epic("Debug");
    await allure.feature("API Key Verification");

    const response = await apiHelper.get("https://reqres.in/api/users", {
      headers: {
        "X-API-KEY": "reqres-free-v1",
      },
    });

    console.log(`Users endpoint status: ${response.status()}`);
    const responseData = await apiHelper.getResponseBody(response);
    console.log("Users response:", responseData);

    if (response.status() === 200) {
      console.log("✅ API key works for users endpoint");
      expect(responseData).toHaveProperty("data");
    }
  });

  test("Debug login endpoint behavior 2", async () => {
    await allure.epic("Debug");
    await allure.feature("ReqRes API Changes");

    const loginData = {
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    };
    console.log("Sending login ", JSON.stringify(loginData));
    console.log("Testing login with API key...");

    try {
      const response = await apiHelper.post(
        "https://reqres.in/api/login",
        loginData,
        {
          headers: {
            // ✅ Fix 1: Use exact case as Postman
            "X-API-KEY": "reqres-free-v1", // Capital KEY, not Key

            // ✅ Fix 2: Add Accept header like Postman
            Accept: "application/json",

            "Content-Type": "application/json",

            // ✅ Fix 3: Add User-Agent to match API expectations
            "User-Agent": "Playwright-Test/1.0",
          },
        }
      );

      console.log(`Status: ${response.status()}`);
      const responseData = await apiHelper.getResponseBody(response);
      console.log("Response:", responseData);

      if (response.status() === 200) {
        expect(responseData).toHaveProperty("token");
        console.log("✅ Login works with API key");
      } else {
        console.log(`❌ Login failed with status: ${response.status()}`);
        console.log("Response body:", responseData);
      }
    } catch (error) {
      console.log("Error during login test:", error);
    }
  });

  test("Direct Playwright login test", async ({ request }) => {
    const data = {
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    };

    console.log("Sending login ", JSON.stringify(data));

    // Direct Playwright request without APIHelper
    const response = await request.post("https://reqres.in/api/login", {
      data, // Direct data property
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "reqres-free-v1",
      },
    });

    console.log(`Direct Playwright Status: ${response.status()}`);
    const responseBody = await response.json();
    console.log("Direct Playwright Response:", responseBody);

    if (response.status() === 200) {
      console.log("✅ Direct Playwright login works!");
      expect(responseBody).toHaveProperty("token");
    } else {
      console.log("❌ Still failing with direct Playwright");
    }
  });
});
