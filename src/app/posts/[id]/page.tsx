import { getPostById } from '@/actions/post';
import { getUserIdFromSession } from '@/actions/user';
import { getAllComments } from '@/actions/comment';
import PostCard from '@/components/postCard';

export default async function PostPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;

	const { id } = resolvedParams;

	const sortBy = resolvedSearchParams?.sortBy ?? 'date';
	const order = resolvedSearchParams?.order ?? 'desc';

	const { post, userVote, voteCount } = await getPostById(id);
	const currentUser = await getUserIdFromSession();
	const { comments } = await getAllComments(id, sortBy, order);

	return (
		<div>
			<div className="max-w-3xl mx-auto p-6 bg-gray-50">
				<PostCard
					post={post}
					currentUser={currentUser}
					comments={comments}
					userVote={userVote}
					voteCount={voteCount}
				/>
			</div>
		</div>
	);
}
