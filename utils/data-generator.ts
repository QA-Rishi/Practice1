import { faker } from "@faker-js/faker";
import * as allure from "allure-js-commons";

// Define the User interface
interface User {
  name: string;
  job: string;
  email: string;
  phone: string;
}

export class DataGenerator {
  static async generateUser(): Promise<User> {
    return await allure.step("Generate test user data", async () => {
      const userData: User = {
        name: faker.person.fullName(),
        job: faker.person.jobTitle(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      };

      console.log(`Generated user: ${userData.name} - ${userData.job}`);
      return userData;
    });
  }

  // ✅ Fixed: Explicitly type the array as User[]
  static async generateUsers(count: number): Promise<User[]> {
    return await allure.step(`Generate ${count} test users`, async () => {
      const users: User[] = []; // ✅ Explicitly typed as User[]

      for (let i = 0; i < count; i++) {
        const user = await this.generateUser();
        users.push(user); // ✅ No more 'never' error
      }

      console.log(`Generated ${count} users`);
      return users;
    });
  }

  static async generateLoginCredentials() {
    return await allure.step("Generate login credentials", async () => {
      const credentials = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      console.log(`Generated credentials for: ${credentials.email}`);
      return credentials;
    });
  }

  // ✅ Non-async version for quick use (no 'never' error)
  static generateSimpleUser(): User {
    return {
      name: faker.person.fullName(),
      job: faker.person.jobTitle(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };
  }

  // ✅ Generate multiple simple users with explicit typing
  static generateSimpleUsers(count: number): User[] {
    const users: User[] = []; // ✅ Explicitly typed

    for (let i = 0; i < count; i++) {
      users.push(this.generateSimpleUser());
    }

    return users;
  }
}
