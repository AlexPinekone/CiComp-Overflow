import { z } from 'zod';

export const schemaNewPost = z.object({
	title: z
		.string()
		.min(5, { message: 'El título debe tener al menos 5 caracteres' }),
	body: z
		.string()
		.min(10, { message: 'El cuerpo debe tener al menos 10 caracteres' }),
	tags: z
		.array(z.string())
		.max(7, { message: 'Solo puedes seleccionar hasta 7 etiquetas' }),
});
