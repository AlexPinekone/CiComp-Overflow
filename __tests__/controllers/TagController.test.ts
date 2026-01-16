/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from 'next/server';
import { TagController } from '@/controller/TagController';
import { TagService } from '@/service/TagService';
import { ErrorHandler } from '@/utils/ErrorHandler';

jest.mock('@/service/TagService');
jest.mock('@/utils/ErrorHandler');

describe('TagController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllTagsCatalog', () => {
		it('should return all tags from catalog (200)', async () => {
			const mockTags = [
				{ label: 'Algoritmos y Complejidad' },
				{ label: 'Bases de Datos' },
				{ label: 'Herramientas de Software' },
			];

			(TagService.getAllTagsCatalog as jest.Mock).mockResolvedValue(
				mockTags
			);

			const res = await TagController.getAllTagsCatalog();

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockTags);
			expect(TagService.getAllTagsCatalog).toHaveBeenCalled();
		});

		it('should return empty array when no tags exist', async () => {
			(TagService.getAllTagsCatalog as jest.Mock).mockResolvedValue([]);

			const res = await TagController.getAllTagsCatalog();

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual([]);
		});

		it('should handle service errors (500)', async () => {
			(TagService.getAllTagsCatalog as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{
						status: 500,
					}
				)
			);

			const res = await TagController.getAllTagsCatalog();

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});

	describe('getTagByNameFromTagsCatalog', () => {
		it('should return tag by name (200)', async () => {
			const mockTag = {
				tagId: 'tag1',
				label: 'Algoritmos y Complejidad',
				softDelete: false,
			};

			(
				TagService.getTagByNameFromTagsCatalog as jest.Mock
			).mockResolvedValue(mockTag);

			const req = new NextRequest('http://localhost/api/tags/byName', {
				method: 'POST',
				body: JSON.stringify({ name: 'Algoritmos y Complejidad' }),
			});

			const res = await TagController.getTagByNameFromTagsCatalog(req);

			expect(res.status).toBe(200);
			expect(await res.json()).toEqual(mockTag);
			expect(TagService.getTagByNameFromTagsCatalog).toHaveBeenCalledWith(
				'Algoritmos y Complejidad'
			);
		});

		it('should return 400 if name is missing', async () => {
			const req = new NextRequest('http://localhost/api/tags/byName', {
				method: 'POST',
				body: JSON.stringify({}),
			});

			const res = await TagController.getTagByNameFromTagsCatalog(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Tag name is required and must be a string',
			});
		});

		it('should return 400 if name is not a string', async () => {
			const req = new NextRequest('http://localhost/api/tags/byName', {
				method: 'POST',
				body: JSON.stringify({ name: 123 }),
			});

			const res = await TagController.getTagByNameFromTagsCatalog(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Tag name is required and must be a string',
			});
		});

		it('should return 400 if name is empty string', async () => {
			const req = new NextRequest('http://localhost/api/tags/byName', {
				method: 'POST',
				body: JSON.stringify({ name: '' }),
			});

			const res = await TagController.getTagByNameFromTagsCatalog(req);

			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({
				error: 'Tag name is required and must be a string',
			});
		});

		it('should return 404 if tag not found', async () => {
			(
				TagService.getTagByNameFromTagsCatalog as jest.Mock
			).mockResolvedValue(null);

			const req = new NextRequest('http://localhost/api/tags/byName', {
				method: 'POST',
				body: JSON.stringify({ name: 'Nonexistent Tag' }),
			});

			const res = await TagController.getTagByNameFromTagsCatalog(req);

			expect(res.status).toBe(404);
			expect(await res.json()).toEqual({
				error: 'Tag not found in catalog',
			});
		});

		it('should handle service errors (500)', async () => {
			(
				TagService.getTagByNameFromTagsCatalog as jest.Mock
			).mockRejectedValue(new Error('Database error'));

			(ErrorHandler.handle as jest.Mock).mockReturnValue(
				new Response(
					JSON.stringify({ error: 'Internal server error' }),
					{
						status: 500,
					}
				)
			);

			const req = new NextRequest('http://localhost/api/tags/byName', {
				method: 'POST',
				body: JSON.stringify({ name: 'Some Tag' }),
			});

			const res = await TagController.getTagByNameFromTagsCatalog(req);

			expect(ErrorHandler.handle).toHaveBeenCalled();
		});
	});
});
