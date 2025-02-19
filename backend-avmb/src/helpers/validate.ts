import { validate } from "class-validator";

export async function validateDTO(dto: any) {
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat();
    return { error: errorMessages };
  }
}
