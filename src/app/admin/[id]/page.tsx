import AdminDashboard from '@/components/AdminDashbord';

export default function AdminPage() {
	return (
		<div className="container mx-auto p-4 min-h-screen bg-gray-100 flex flex-col">
			<h1 className="text-5xl font-bold mb-4">Listado de Posts</h1>

			<AdminDashboard />
		</div>
	);
}
