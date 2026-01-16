import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import RequestList from '@/components/RequestList';
import ActivityList from './ActivityList';
import { AdminRegisterContainer } from '@/components/Register';
import GeneratePDF from './GeneratePDF';

export default function AdminTabsComponent() {
	return (
		<Tabs defaultValue="posts" className="w-full">
			{/* Pestañas */}
			<TabsList className="flex justify-center space-x-4 bg-gray-100 rounded-lg p-2">
				{/*<TabsTrigger
					value="posts"
					className="px-4 py-2 text-lg font-medium">
					Actividad reciente
				</TabsTrigger>*/}
				<TabsTrigger
					value="requests"
					className="px-4 py-2 text-lg font-medium">
					Solicitudes
				</TabsTrigger>
				<TabsTrigger
					value="register"
					className="px-4 py-2 text-lg font-medium">
					Nuevo Usuario
				</TabsTrigger>
				<TabsTrigger
					value="report"
					className="px-4 py-2 text-lg font-medium">
					Reporte
				</TabsTrigger>
			</TabsList>

			{/* Contenido de las pestañas */}
			{/*<TabsContent value="posts">
				<ActivityList />
			</TabsContent>*/}
			<TabsContent value="requests">
				<RequestList />
			</TabsContent>
			<TabsContent value="register">
				<AdminRegisterContainer />
			</TabsContent>
			<TabsContent value="report">
				<GeneratePDF />
			</TabsContent>
		</Tabs>
	);
}
