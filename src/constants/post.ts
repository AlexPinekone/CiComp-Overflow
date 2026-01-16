import { PostWithAuthor } from '@/model/PostWithAuthor';

export enum PostDateFilter {
	ALL = 'all_time',
	LAST_24_HOURS = 'last_24_hours',
	LAST_WEEK = 'last_week',
	LAST_MONTH = 'last_month',
	LAST_6_MONTHS = 'last_6_months',
	LAST_YEAR = 'last_year',
}

export type PostOrderKey = 'newest' | 'oldest' | 'votes';

export const posts: PostWithAuthor[] = [
	{
		postId: '1',
		title: 'Explorando el Universo con la IA',
		body: 'La inteligencia artificial ha revolucionado la astronomía al permitir la clasificación automatizada de millones de objetos celestes. Gracias a modelos de aprendizaje automático, podemos identificar supernovas, exoplanetas y galaxias distantes con mayor precisión que nunca.',
		status: 'PUBLISHED',
		createdAt: new Date(),
		updatedAt: new Date(),
		userId: 'user-1',
		softDelete: false,
		author: {
			name: 'Dra. Ana Estela',
			lastName: 'Pérez Mejía',
		},
		tags: ['Astronomía', 'Inteligencia Artificial', 'Ciencia de Datos'],
	},
	{
		postId: '2',
		title: 'Optimización en Bases de Datos SQL',
		body: 'El uso eficiente de índices y consultas optimizadas es clave para mejorar el rendimiento de bases de datos SQL. Exploramos estrategias avanzadas para manejar grandes volúmenes de datos sin comprometer la velocidad de respuesta.',
		status: 'PUBLISHED',
		createdAt: new Date(),
		updatedAt: new Date(),
		userId: 'user-2',
		softDelete: false,
		author: {
			name: 'Rebeca',
			lastName: 'Mendoza',
		},
		tags: ['SQL', 'Optimización', 'Bases de Datos'],
	},
	{
		postId: '3',
		title: 'Desarrollo Web Escalable con Next.js',
		body: 'Next.js ofrece una arquitectura flexible y escalable para el desarrollo de aplicaciones web modernas. En este artículo, analizamos buenas prácticas para organizar proyectos, manejar rutas dinámicas y optimizar el rendimiento con SSR y SSG.',
		status: 'PUBLISHED',
		createdAt: new Date(),
		updatedAt: new Date(),
		userId: 'user-3',
		softDelete: false,
		author: {
			name: 'Juan',
			lastName: 'Pérez',
		},
		tags: ['Next.js', 'Desarrollo Web', 'Escalabilidad'],
	},
];
