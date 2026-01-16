'use server';

import axios from 'axios';
import { getCurrentSessionFromCookies, getFetchHeaders } from '@/lib/session';

export async function getAllTagsCatalog() {
	const session = await getCurrentSessionFromCookies();
	const headers = getFetchHeaders({
		Authorization: session,
	});

	try {
		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/api/tags`,
			{
				headers,
			}
		);

		if (response.status !== 200) {
			return {
				errors: { general: ['Error al obtener las etiquetas'] },
			};
		}
		return { tags: response.data };
	} catch {
		return {
			errors: {
				general: ['Error al obtener las etiquetas del catálogo'],
			},
		};
	}
}
