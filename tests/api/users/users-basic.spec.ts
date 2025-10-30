import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";
import { APIHelper } from "../../../utils/api-helper";
import { DataGenerator } from "../../../utils/data-generator";

test.describe("User Management - Basic Tests", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
    await allure.epic("User Management");
    await allure.feature("Basic CRUD Operations");

    // ✅ Login once if your API requires authentication
    // For reqres.in it’s open, so this is optional.
    // Example:
    // const loginResponse = await apiHelper.post("https://reqres.in/api/login", {
    //   email: "eve.holt@reqres.in",
    //   password: "cityslicka"
    // });
    // const loginData = await apiHelper.getResponseBody<{ token: string }>(loginResponse);
    // apiHelper.setAuthToken(loginData.token);
  });

  test("GET - List all users @smoke", async () => {
    await allure.story("Retrieve user list");
    await allure.severity("critical");
    await allure.tag("smoke");
    await allure.tag("users");
    await allure.tag("get");
    await allure.description("Verify that the API returns a list of users");

    const response = await apiHelper.get("https://reqres.in/api/users?page=1");
    await apiHelper.validateResponse(response, 200);

    const responseData = await apiHelper.getResponseBody(response);
    expect(responseData).toHaveProperty("data");
    expect(Array.isArray(responseData.data)).toBe(true);
    expect(responseData.data.length).toBeGreaterThan(0);

    console.log(`Found ${responseData.data.length} users`);
  });

  test("POST - Create new user @smoke", async () => {
    await allure.story("Create new user");
    await allure.severity("critical");
    await allure.tag("smoke");
    await allure.tag("users");
    await allure.tag("post");
    await allure.tag("create");

    const userData = DataGenerator.generateSimpleUser();

    const response = await apiHelper.post(
      "https://reqres.in/api/users",
      userData
    );
    await apiHelper.validateResponse(response, 201);

    const responseData = await apiHelper.getResponseBody(response);
    expect(responseData.name).toBe(userData.name);
    expect(responseData.job).toBe(userData.job);
    expect(responseData).toHaveProperty("id");
    expect(responseData).toHaveProperty("createdAt");

    console.log(`Created user with ID: ${responseData.id}`);
  });

  test("PUT - Update user @smoke", async () => {
    await allure.story("Update existing user");
    await allure.severity("normal");
    await allure.tag("smoke");
    await allure.tag("users");
    await allure.tag("put");
    await allure.tag("update");

    const updateData = {
      name: "Updated User Name",
      job: "Updated Job Title",
    };

    const response = await apiHelper.put(
      "https://reqres.in/api/users/2",
      updateData
    );
    await apiHelper.validateResponse(response, 200);

    const responseData = await apiHelper.getResponseBody(response);
    expect(responseData.name).toBe(updateData.name);
    expect(responseData.job).toBe(updateData.job);
    expect(responseData).toHaveProperty("updatedAt");

    console.log(`Updated user successfully at: ${responseData.updatedAt}`);
  });

  test("DELETE - Remove user @smoke", async () => {
    await allure.story("Delete user");
    await allure.severity("normal");
    await allure.tag("smoke");
    await allure.tag("users");
    await allure.tag("delete");

    const response = await apiHelper.delete("https://reqres.in/api/users/2");
    await apiHelper.validateResponse(response, 204);

    console.log("User deleted successfully");
  });

  test("GET - User not found @smoke", async () => {
    await allure.story("Handle user not found");
    await allure.severity("normal");
    await allure.tag("smoke");
    await allure.tag("users");
    await allure.tag("negative");
    await allure.tag("error-handling");

    const response = await apiHelper.get("https://reqres.in/api/users/999");
    await apiHelper.validateResponse(response, 404);

    console.log("Correctly handled user not found scenario");
  });
});
