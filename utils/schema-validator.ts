import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";

export class SchemaValidator {
  private static ajv: Ajv;

  static get instance(): Ajv {
    if (!this.ajv) {
      const ajv = new Ajv({
        allErrors: true, // report all errors, not just the first
        strict: false, // practical for real-world APIs
        allowUnionTypes: true, // supports union-like schemas
      });
      addFormats(ajv); // enables format checks: email, uri, date-time
      this.ajv = ajv;
    }
    return this.ajv;
  }

  static validateOrThrow(schema: object, data: unknown, context?: string) {
    const validate = this.instance.compile(schema);
    const valid = validate(data);
    if (!valid) {
      const errors: ErrorObject[] = validate.errors ?? [];
      const details = errors
        .map((e: ErrorObject) => {
          const path =
            e.instancePath && e.instancePath.length > 0
              ? e.instancePath
              : "(root)";
          const message = e.message ?? "";
          const params = e.params ? JSON.stringify(e.params) : "";
          return `${path} ${message} ${params}`.trim();
        })
        .join("\n");

      const prefix = context ? `[Schema: ${context}] ` : "";
      throw new Error(`${prefix}Schema validation failed:\n${details}`);
    }
  }
}
