import { z } from "zod";
import { ValidationMessage } from "./validation";

export const searchSchema = z.string({
  invalid_type_error: ValidationMessage.Type("Search", "string"),
  required_error: ValidationMessage.Require("Search"),
});
