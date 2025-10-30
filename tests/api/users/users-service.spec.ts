import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";
import { UserService } from "../../../services/user-service";
import { APIHelper } from "../../../utils/api-helper";
import { DataGenerator } from "../../../utils/data-generator";

test.describe("User Service Tests", () => {
  let userService: UserService;
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
    userService = new UserService(apiHelper);
    await allure.epic("User Management");
    await allure.feature("Service Layer Operations");
  });

  test("Complete user CRUD workflow @regression", async () => {
    await allure.story("End-to-end user management");
    await allure.severity("critical");
    await allure.tag("regression");
    await allure.tag("workflow");
    await allure.tag("crud");
    await allure.tag("e2e");

    // ✅ FIXED: Use correct destructuring with renaming syntax
    // Step 1: Get all users
    const { response: getAllResponse, data: allUsersData } =
      await userService.getAllUsers();
    expect(getAllResponse.status()).toBe(200);
    expect(allUsersData.data.length).toBeGreaterThan(0);

    // Step 2: Get specific user
    const { response: getUserResponse, data: userData } =
      await userService.getUserById(2);
    expect(getUserResponse.status()).toBe(200);
    expect(userData.data.id).toBe(2);

    // Step 3: Create new user
    const newUserData = DataGenerator.generateSimpleUser();
    const { response: createResponse, data: createdUserData } =
      await userService.createUser(newUserData);
    expect(createResponse.status()).toBe(201);
    expect(createdUserData.name).toBe(newUserData.name);

    // Step 4: Update user
    const updateData = { name: "Updated Name", job: "Updated Job" };
    const { response: updateResponse, data: updatedUserData } =
      await userService.updateUser(2, updateData);
    expect(updateResponse.status()).toBe(200);
    expect(updatedUserData.name).toBe(updateData.name);

    // Step 5: Delete user
    const { response: deleteResponse } = await userService.deleteUser(2);
    expect(deleteResponse.status()).toBe(204);

    console.log("✅ Complete CRUD workflow successful");
  });

  test("Authentication workflow @regression", async () => {
    await allure.story("Login and token management");
    await allure.severity("blocker");
    await allure.tag("regression");
    await allure.tag("auth");
    await allure.tag("login");

    // ✅ FIXED: Use correct destructuring with renaming syntax
    const { response: loginResponse, data: loginData } =
      await userService.login("eve.holt@reqres.in", "cityslicka");
    expect(loginResponse.status()).toBe(200);
    expect(loginData.token).toBeTruthy();

    // Use token for subsequent requests
    const { response: usersResponse, data: usersData } =
      await userService.getAllUsers();
    expect(usersResponse.status()).toBe(200);
    expect(usersData.data).toBeInstanceOf(Array);

    console.log("✅ Authentication workflow completed");
  });

  test("Data validation workflow @regression", async () => {
    await allure.story("Validate response data structure");
    await allure.severity("normal");
    await allure.tag("regression");
    await allure.tag("validation");
    await allure.tag("data");

    // ✅ FIXED: Use correct destructuring with renaming syntax
    const { response: getUsersResponse, data: usersListData } =
      await userService.getAllUsers(1);
    expect(getUsersResponse.status()).toBe(200);
    expect(usersListData).toHaveProperty("data");
    expect(usersListData).toHaveProperty("total");
    expect(usersListData).toHaveProperty("page");

    const { response: getSingleUserResponse, data: singleUserData } =
      await userService.getUserById(1);
    expect(getSingleUserResponse.status()).toBe(200);
    expect(singleUserData.data).toHaveProperty("id");
    expect(singleUserData.data).toHaveProperty("email");
    expect(singleUserData.data).toHaveProperty("first_name");

    console.log("✅ Data validation completed");
  });

  test("Error handling workflow @regression", async () => {
    await allure.story("Handle API error scenarios");
    await allure.severity("normal");
    await allure.tag("regression");
    await allure.tag("error-handling");
    await allure.tag("negative");

    // Test user not found
    const { response: notFoundResponse } = await userService.getUserById(999);
    expect(notFoundResponse.status()).toBe(404);

    console.log("✅ Error handling verified");
  });
});
