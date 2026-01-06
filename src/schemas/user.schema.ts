import z from "zod";

export const createUserSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(3),
      lastName: z.string().min(1),
      email: z.email(),
      password: z.string().min(8),
      confirmPassword: z.string().min(8),
    })
    .refine((val) => val.password === val.confirmPassword, {
      message: "password gotta be match",
      path: ["confirmPassword"],
    }),
});

export const verifyUserSchema = z.object({
  params: z.object({
    id: z.string(),
    verificationCode: z.string(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: z.string().min(8),
      confirmPassword: z.string().min(8),
    })
    .refine((val) => val.password === val.confirmPassword, {
      message: "password gotta be match",
      path: ["confirmPassword"],
    }),
  params: z.object({
    id: z.string(),
    passwordResetCode: z.string(),
  }),
});

export type TCreateUserSchema = z.infer<typeof createUserSchema>;

export type TVerifyUserSchema = z.infer<typeof verifyUserSchema>;

export type TForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
