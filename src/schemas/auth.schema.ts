import z from "zod";

export const createSessionSchema = z.object({
    body: z.object({
        email: z.email(),
        password: z.string().min(8)
    })
})

export type TCreateSessionSchema = z.infer<typeof createSessionSchema>;