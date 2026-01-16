import { User } from 'lucide-react';

interface ActivityProps {
	authorName: string;
	activity: string;
	dateModify: string;
	dateOriginal: string;
}

export default function Activity({
	authorName,
	activity,
	dateModify,
	dateOriginal,
}: ActivityProps) {
	return (
		<div className="border border-gray-200 rounded-lg p-6 shadow-md bg-white flex flex-col hover:shadow-lg transition-shadow">
			{/* Encabezado: Icono, Autor y Fecha */}
			<div className="flex items-center justify-between mb-4">
				{/* Icono y Nombre */}
				<div className="flex items-center">
					<div className="bg-gray-200 p-2 rounded-full">
						<User className="w-10 h-10 text-gray-600" />
					</div>
					<span className="ml-3 text-[22px] font-medium text-gray-900">
						{authorName}
					</span>
				</div>

				{/* Fecha */}
				<span className="text-sm text-gray-500">{dateModify}</span>
			</div>

			{/* Mensaje de actividad */}
			<p className="text-gray-700 mb-4 flex justify-between text-lg">
				<span>
					<span className="font-semibold">{authorName}</span> ha{' '}
					{activity}.
				</span>
				<span className="text-sm text-gray-500">{dateOriginal}</span>
			</p>
		</div>
	);
}
