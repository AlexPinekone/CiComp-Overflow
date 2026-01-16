// __tests__/src/components/PostCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
jest.mock('@tiptap/react', () => ({
	Editor: class {
		constructor(opts: any) {
			this.opts = opts;
		}
		opts: any;
		getText() {
			return this.opts.content;
		}
	},
}));
jest.mock('@tiptap/starter-kit', () => ({}));
import PostCard from '@/components/post';

const basePost = {
	post: {
		title: 'Título de prueba',
		body: 'Contenido del post con **markdown** y más texto',
		userName: 'Autor Prueba',
		tags: ['tag1', 'tag2', 'tag3'],
		upVoteCount: 3,
		downVoteCount: 1,
	},
};

describe('PostCard component', () => {
	it('renderiza título, contenido y autor', () => {
		render(<PostCard {...basePost} />);
		expect(screen.getByText('Título de prueba')).toBeInTheDocument();
		expect(screen.getByText('Autor Prueba')).toBeInTheDocument();
		// El contenido se procesa y se obtiene como texto plano
		expect(
			screen.getByText(/Contenido del post/, { exact: false })
		).toBeInTheDocument();
	});

	it('muestra las tags correctamente', () => {
		render(<PostCard {...basePost} />);
		basePost.post.tags.forEach((tg) => {
			expect(screen.getByText(tg)).toBeInTheDocument();
		});
	});

	it('muestra conteo de votos ▲ y ▼', () => {
		render(<PostCard {...basePost} />);
		expect(screen.getByText('▲3')).toBeInTheDocument();
		expect(screen.getByText('▼1')).toBeInTheDocument();
	});

	it('no renderiza sección de tags si la lista está vacía', () => {
		const postSinTags = {
			...basePost,
			post: { ...basePost.post, tags: [] },
		};
		render(<PostCard {...postSinTags} />);
		['tag1', 'tag2', 'tag3'].forEach((tg) => {
			expect(screen.queryByText(tg)).not.toBeInTheDocument();
		});
	});
});
