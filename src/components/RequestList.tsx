'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import RequestCard from '@/components/request';
import { Request } from '@/model/Request';
import { getAllRequests, getRequestsPaginated } from '@/actions/requests';
import PaginationControls from './PaginationControls';

export default function RequestList() {
	const [requests, setRequests] = useState<Request[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedTab, setSelectedTab] = useState<
		'post' | 'comment' | 'user' | 'general'
	>('post');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRequests = async () => {
			setLoading(true);
			const res = await getRequestsPaginated(selectedTab, page, 10);

			if (res && Array.isArray(res.requests)) {
				setRequests(res.requests);
				setTotalPages(res.totalPages || 1);
			} else {
				setRequests([]);
				setTotalPages(1);
			}
			setLoading(false);
		};
		fetchRequests();
	}, [selectedTab, page]);

	return (
		<div className="bg-[#F6F8F9] text-black">
			<Tabs defaultValue="posts" className="w-full mb-6">
				<TabsList className="flex justify-center space-x-4 bg-gray-100 rounded-lg p-2">
					<TabsTrigger
						value="post"
						className="px-4 py-2 text-lg font-medium"
						onClick={() => {
							setSelectedTab('post');
							setPage(1);
						}}>
						Posts
					</TabsTrigger>
					<TabsTrigger
						value="comment"
						className="px-4 py-2 text-lg font-medium"
						onClick={() => {
							setSelectedTab('comment');
							setPage(1);
						}}>
						Comentarios
					</TabsTrigger>
					<TabsTrigger
						value="user"
						className="px-4 py-2 text-lg font-medium"
						onClick={() => {
							setSelectedTab('user');
							setPage(1);
						}}>
						Usuarios
					</TabsTrigger>
					<TabsTrigger
						value="general"
						className="px-4 py-2 text-lg font-medium"
						onClick={() => {
							setSelectedTab('general');
							setPage(1);
						}}>
						Generales
					</TabsTrigger>
				</TabsList>

				<TabsContent value="post">
					{selectedTab === 'post' && loading ? (
						<p className="text-center mt-4">Cargando...</p>
					) : (
						<>
							{requests.map((request) => (
								<RequestCard
									key={request.requestId}
									userId={request.userId || ''}
									description={request.body}
									createdAt={request.createdAt}
									status={request.status}
									postId={request.referencePostId}
									requestId={request.requestId}
								/>
							))}
							<PaginationControls
								page={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						</>
					)}
				</TabsContent>

				<TabsContent value="comment">
					{selectedTab === 'comment' && loading ? (
						<p className="text-center mt-4">Cargando...</p>
					) : (
						<>
							{requests.map((request) => (
								<RequestCard
									key={request.requestId}
									userId={request.userId || ''}
									description={request.body}
									createdAt={request.createdAt}
									status={request.status}
									postId={request.referencePostId}
									commentId={request.referenceCommentId}
									requestId={request.requestId}
								/>
							))}
							<PaginationControls
								page={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						</>
					)}
				</TabsContent>

				<TabsContent value="user">
					{selectedTab === 'user' && loading ? (
						<p className="text-center mt-4">Cargando...</p>
					) : (
						<>
							{requests.map((request) => (
								<RequestCard
									key={request.requestId}
									userId={request.userId || ''}
									description={request.body}
									createdAt={request.createdAt}
									status={request.status}
									reportedUserId={request.referenceUserId}
									requestId={request.requestId}
								/>
							))}
							<PaginationControls
								page={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						</>
					)}
				</TabsContent>
				<TabsContent value="general">
					{selectedTab === 'general' && loading ? (
						<p className="text-center mt-4">Cargando...</p>
					) : (
						<>
							{requests.map((request) => (
								<RequestCard
									key={request.requestId}
									userId={request.userId || ''}
									title={request.title}
									description={request.body}
									createdAt={request.createdAt}
									status={request.status}
									requestId={request.requestId}
								/>
							))}
							<PaginationControls
								page={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						</>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
