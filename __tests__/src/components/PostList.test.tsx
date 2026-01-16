import React from 'react';
import { render, screen } from '@testing-library/react';
import PostList from '@/components/postList';

jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		prefetch: jest.fn(),
	}),
	usePathname: () => '/posts',
	useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/useInfinitePosts', () => ({
	useInfinitePosts: () => ({
		posts: [
			{
				postId: 'p1',
				title: 'Post 1',
				body: 'Content 1',
				userName: 'Author1',
				tags: ['tag1', 'tag2'],
			},
			{
				postId: 'p2',
				title: 'Post 2',
				body: 'Content 2',
				userName: 'Author2',
				tags: ['tag3'],
			},
		],
		isLoading: false,
		isError: false,
		isFetchingNextPage: false,
		hasMore: false,
		loadMoreRef: { current: null },
		refetch: jest.fn(),
		loadMore: jest.fn(),
		total: 2,
		currentPage: 1,
		totalPages: 1,
	}),
}));

jest.mock('@/actions/tag', () => ({
	getAllTagsCatalog: jest.fn().mockResolvedValue({ tags: [] }),
}));

describe('PostList', () => {
	it('renders posts returned by the hook', async () => {
		render(<PostList />);

		expect(await screen.findByText('Post 1')).toBeInTheDocument();
		expect(screen.getByText('Author1')).toBeInTheDocument();
		expect(screen.getByText('Post 2')).toBeInTheDocument();
		expect(screen.getByText('Author2')).toBeInTheDocument();

		// Tags
		expect(screen.getByText('tag1')).toBeInTheDocument();
		expect(screen.getByText('tag3')).toBeInTheDocument();
	});
});
