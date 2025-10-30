import { test } from "@playwright/test";
import * as allure from "allure-js-commons";
import { APIHelper } from "../../../utils/api-helper";
import { Assertions } from "../../../utils/assertions";
import { SchemaValidator } from "../../../utils/schema-validator";
import usersList from "../../../schema/users/users-list.schema.json";
import userCreated from "../../../schema/users/user-created.schema.json";
import userUpdated from "../../../schema/users/user-updated.schema.json";

test.describe("User Management Workflow", () => {
  let api: APIHelper;

  test.beforeEach(async ({ request }) => {
    api = new APIHelper(request);
    await allure.epic("User Management");
    await allure.feature("Chained Workflow");
  });

  test("CRUD workflow @regression", async () => {
    await allure.story("Create → List → Update → Delete");
    await allure.severity("critical");
    await allure.tag("regression");
    await allure.tag("workflow");

    // 1) Create user
    const createPayload = { name: "John Doe", job: "QA Engineer" };
    const createRes = await api.post(
      "https://reqres.in/api/users",
      createPayload
    );
    await api.validateResponse(createRes, 201);
    const created = await api.getResponseBody(createRes);
    Assertions.assertCreatedUserShape(created);
    console.log(`Created ID: ${created.id}`);

    // 2) List users (validate contract shape)
    const listRes = await api.get("https://reqres.in/api/users", {
      params: { page: 1 },
    });
    await api.validateResponse(listRes, 200);
    const listBody = await api.getResponseBody(listRes);
    Assertions.assertUsersListShape(listBody);

    // 3) Update user (using static id 2 as ReqRes supports demo paths)
    const updatePayload = { name: "John Updated", job: "Senior QA" };
    const updateRes = await api.put(
      "https://reqres.in/api/users/2",
      updatePayload
    );
    await api.validateResponse(updateRes, 200);
    const updated = await api.getResponseBody(updateRes);
    Assertions.assertUpdatedUserShape(updated);

    // 4) Delete user (demo behavior: 204)
    const deleteRes = await api.delete("https://reqres.in/api/users/2");
    await api.validateResponse(deleteRes, 204);
  });

  test("CRUD workflow with Validator @regression", async () => {
    const createPayload = { name: "John Doe", job: "QA Engineer" };
    const createRes = await api.post(
      "https://reqres.in/api/users",
      createPayload
    );
    await api.validateResponse(createRes, 201);
    const created = await api.getResponseBody(createRes);
    SchemaValidator.validateOrThrow(userCreated, created, "User Created");

    const listRes = await api.get("https://reqres.in/api/users", {
      params: { page: 1 },
    });
    await api.validateResponse(listRes, 200);
    const listBody = await api.getResponseBody(listRes);
    SchemaValidator.validateOrThrow(usersList, listBody, "Users List");

    const updatePayload = { name: "John Updated", job: "Senior QA" };
    const updateRes = await api.put(
      "https://reqres.in/api/users/2",
      updatePayload
    );
    await api.validateResponse(updateRes, 200);
    const updated = await api.getResponseBody(updateRes);
    SchemaValidator.validateOrThrow(userUpdated, updated, "User Updated");

    const deleteRes = await api.delete("https://reqres.in/api/users/2");
    await api.validateResponse(deleteRes, 204);
  });
});
