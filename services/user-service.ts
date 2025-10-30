import { APIRequestContext } from "@playwright/test";
import * as allure from "allure-js-commons";
import { APIHelper } from "../utils/api-helper";

export class UserService {
  private apiHelper: APIHelper;

  constructor(apiHelper: APIHelper) {
    this.apiHelper = apiHelper;
  }

  async getAllUsers(page: number = 1) {
    return await allure.step(`Get all users (page ${page})`, async () => {
      const response = await this.apiHelper.get(`/api/users?page=${page}`);
      const data = await this.apiHelper.getResponseBody(response);
      return { response, data };
    });
  }

  async getUserById(id: number) {
    return await allure.step(`Get user by ID: ${id}`, async () => {
      const response = await this.apiHelper.get(`/api/users/${id}`);
      const data = await this.apiHelper.getResponseBody(response);
      return { response, data };
    });
  }

  async createUser(userData: any) {
    return await allure.step("Create new user", async () => {
      const response = await this.apiHelper.post(`/api/users`, userData);
      const data = await this.apiHelper.getResponseBody(response);
      return { response, data };
    });
  }

  async updateUser(id: number, userData: any) {
    return await allure.step(`Update user ID: ${id}`, async () => {
      const response = await this.apiHelper.put(`/api/users/${id}`, userData);
      const data = await this.apiHelper.getResponseBody(response);
      return { response, data };
    });
  }

  async deleteUser(id: number) {
    return await allure.step(`Delete user ID: ${id}`, async () => {
      const response = await this.apiHelper.delete(`/api/users/${id}`);
      return { response };
    });
  }

  async login(email: string, password: string) {
    return await allure.step("User login", async () => {
      const response = await this.apiHelper.post(`/api/login`, {
        email,
        password,
      });
      const data = await this.apiHelper.getResponseBody(response);
      if (response.ok() && data.token) {
        this.apiHelper.setAuthToken(data.token);
      }
      return { response, data };
    });
  }
}
