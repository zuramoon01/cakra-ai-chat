import { z } from "zod";
import { ValidationMessage } from "./validation";

export const usernameSchema = z
  .string({
    invalid_type_error: ValidationMessage.Type("Nama", "string"),
    required_error: ValidationMessage.Require("Nama"),
  })
  .min(3, {
    message: ValidationMessage.Min("Nama", 3),
  })
  .max(25, {
    message: ValidationMessage.Max("Nama", 25),
  });

export const passwordSchema = z
  .string({
    invalid_type_error: ValidationMessage.Type("Kata sandi", "string"),
    required_error: ValidationMessage.Require("Kata sandi"),
  })
  .min(8, {
    message: ValidationMessage.Min("Kata sandi", 8),
  })
  .max(255, {
    message: ValidationMessage.Max("Kata sandi", 255),
  });

export const confirmPasswordSchema = z
  .string({
    invalid_type_error: ValidationMessage.Type(
      "Konfirmasi kata sandi",
      "string",
    ),
    required_error: ValidationMessage.Require("Konfirmasi kata sandi"),
  })
  .min(8, {
    message: ValidationMessage.Min("Konfirmasi kata sandi", 8),
  })
  .max(255, {
    message: ValidationMessage.Max("Konfirmasi kata sandi", 255),
  });
