import { getUserFromSession } from '@/actions/user';
import PostInput from '@/components/postInput';
import PostList from '@/components/postList';

export default async function PostsPage() {
	const { userId } = await getUserFromSession();

	return (
		<div className="container mx-auto p-4 relative grow bg-gray-100 flex flex-col px-4 ">
			{/* <h1 className="text-5xl font-bold mb-4">Listado de Posts</h1> */}
			{userId && <PostInput />}
			<PostList />
		</div>
	);
}
