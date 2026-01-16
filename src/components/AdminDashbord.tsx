import { getPostsCountLastMonth, getTotalPostsCount } from '@/actions/post';
import { getProfileById } from '@/actions/profile';
import { getTotalRequestsCount } from '@/actions/requests';
import { getUserIdFromSession } from '@/actions/user';
import TabsComponent from '@/components/AdminTabsComponent';
import { BadgeCheckIcon, StarIcon, TrophyIcon } from 'lucide-react';
import Medal from './Medal';
import PictureProfile from './PictureProfile';
import AdminContainer from './ProfileContainer';
import Username from './UserName';

export default async function AdminDashboard() {
	const userId = await getUserIdFromSession();
	const profile = userId ? await getProfileById(userId) : null;

	const { count: totalPosts } = await getTotalPostsCount();
	const { count: recentPosts } = await getPostsCountLastMonth();
	const { count: totalRequests } = await getTotalRequestsCount();

	return (
		<div>
			<div className="flex items-center justify-center gap-6 p-4">
				<div>
					<PictureProfile
						imageUrl="https://wallpapers.com/images/hd/cool-neon-blue-profile-picture-u9y9ydo971k9mdcf.jpg"
						size={200}
					/>
				</div>

				<div>
					<Username name={profile?.userName ?? 'Administrador'} />
					<div className="grid grid-cols-3 gap-6 mt-6 h-40">
						<AdminContainer
							title="Todas las publicaciones"
							value={totalPosts ?? 0}
						/>
						<AdminContainer
							title="Publicaciones el último mes"
							value={recentPosts ?? 0}
						/>
						<AdminContainer
							title="Solicitudes Pendientes"
							value={totalRequests ?? 0}
						/>
					</div>
				</div>
			</div>

			<TabsComponent />
		</div>
	);
}
