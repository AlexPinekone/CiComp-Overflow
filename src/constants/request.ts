type RequestStatus = 'pendiente' | 'aprobada' | 'rechazada';
import { Request } from '@/model/Request';

export const requests: Request[] = [
	{
		requestId: '1',
		userId: '1',
		title: 'Acceso al panel de administración',
		body: 'Solicito acceso al panel de administración para gestionar publicaciones.',
		type: 'post', // Puede ser 'post' o 'comment'
		status: 'pendiente',
		createdAt: new Date('2025-03-07'), // Fecha en formato Date
		updatedAt: new Date('2025-03-07'), // Fecha en formato Date
	},
	{
		requestId: '2',
		userId: '2',
		title: 'Unirme al equipo de moderadores',
		body: 'Me gustaría unirme al equipo de moderadores para revisar contenido inapropiado.',
		type: 'post', // Puede ser 'post' o 'comment'
		status: 'aprobada',
		createdAt: new Date('2025-03-06'),
		updatedAt: new Date('2025-03-06'),
	},
	{
		requestId: '3',
		userId: '3',
		title: 'Modificar etiquetas en publicaciones',
		body: 'Requiero permisos para modificar etiquetas en las publicaciones.',
		type: 'comment', // Tipo de solicitud: 'post' o 'comment'
		status: 'rechazada',
		postId: '123', // Referencia a un post relacionado (si aplica)
		commentId: null, // Si es un comentario, se deja null
		createdAt: new Date('2025-03-05'),
		updatedAt: new Date('2025-03-05'),
	},
	{
		requestId: '4',
		userId: '4',
		title: 'Acceso a estadísticas avanzadas',
		body: 'Estoy solicitando acceso a estadísticas avanzadas del sistema.',
		type: 'comment', // Tipo de solicitud: 'post' o 'comment'
		status: 'rechazada',
		postId: '124',
		commentId: null,
		createdAt: new Date('2025-03-04'),
		updatedAt: new Date('2025-03-04'),
	},
	// Datos adicionales de ejemplo
	{
		requestId: '5',
		userId: '5',
		title: 'Propuesta de nueva función',
		body: 'Quiero proponer una nueva función para la plataforma que permita personalizar el perfil.',
		type: 'post',
		status: 'pendiente',
		createdAt: new Date('2025-03-03'),
		updatedAt: new Date('2025-03-03'),
	},
	{
		requestId: '6',
		userId: '6',
		title: 'Ayuda para crear un nuevo post',
		body: 'Necesito ayuda para entender cómo crear un nuevo post en el sistema.',
		type: 'comment',
		status: 'aprobada',
		postId: '125',
		commentId: null,
		createdAt: new Date('2025-03-02'),
		updatedAt: new Date('2025-03-02'),
	},
];
