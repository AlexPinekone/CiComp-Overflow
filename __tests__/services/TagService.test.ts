import { TagService } from '@/service/TagService';
import { TagDAO } from '@/dao/TagDAO';
import { Tag } from '@/model/Tags';

// Mock del DAO
jest.mock('@/dao/TagDAO');

describe('TagService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllTagsCatalog', () => {
		it('should return all tags from catalog', async () => {
			const mockTags = [
				{
					label: 'Algoritmos y Complejidad',
					tagId: '1',
					tagName: 'Algoritmos y Complejidad',
				},
				{
					label: 'Bases de Datos',
					tagId: '2',
					tagName: 'Bases de Datos',
				},
				{
					label: 'Herramientas de Software',
					tagId: '3',
					tagName: 'Herramientas de Software',
				},
			];

			(TagDAO.getAllTagsCatalog as jest.Mock).mockResolvedValue(mockTags);

			const result = await TagService.getAllTagsCatalog();

			expect(TagDAO.getAllTagsCatalog).toHaveBeenCalled();
			expect(result).toEqual(mockTags);
			expect(result).toHaveLength(3);
		});

		it('should return tags sorted alphabetically', async () => {
			const mockTags = [
				{ label: 'Algoritmos y Complejidad' },
				{ label: 'Bases de Datos' },
				{ label: 'Herramientas de Software' },
			];

			(TagDAO.getAllTagsCatalog as jest.Mock).mockResolvedValue(mockTags);

			const result = await TagService.getAllTagsCatalog();

			expect(result[0].label).toBe('Algoritmos y Complejidad');
			expect(result[1].label).toBe('Bases de Datos');
			expect(result[2].label).toBe('Herramientas de Software');
		});

		it('should return empty array when no tags exist', async () => {
			(TagDAO.getAllTagsCatalog as jest.Mock).mockResolvedValue([]);

			const result = await TagService.getAllTagsCatalog();

			expect(result).toEqual([]);
		});

		it('should handle multiple tags with same label correctly', async () => {
			const mockTags = [
				{ label: 'Algoritmos y Complejidad', tagId: '1' },
				{ label: 'Algoritmos y Complejidad', tagId: '2' },
			];

			(TagDAO.getAllTagsCatalog as jest.Mock).mockResolvedValue(mockTags);

			const result = await TagService.getAllTagsCatalog();

			expect(result).toHaveLength(2);
		});
	});

	describe('getTagByNameFromTagsCatalog', () => {
		it('should return tag when found by name', async () => {
			const mockTag: Tag = {
				tagId: '1',
				tagName: 'Algoritmos y Complejidad',
				createdAt: new Date(),
				updatedAt: new Date(),
				softDelete: false,
			};

			(TagDAO.getTagByNameFromTagsCatalog as jest.Mock).mockResolvedValue(
				mockTag
			);

			const result = await TagService.getTagByNameFromTagsCatalog(
				'Algoritmos y Complejidad'
			);

			expect(TagDAO.getTagByNameFromTagsCatalog).toHaveBeenCalledWith(
				'Algoritmos y Complejidad'
			);
			expect(result).toEqual(mockTag);
			expect(result?.tagName).toBe('Algoritmos y Complejidad');
		});

		it('should return null when tag not found', async () => {
			(TagDAO.getTagByNameFromTagsCatalog as jest.Mock).mockResolvedValue(
				null
			);

			const result =
				await TagService.getTagByNameFromTagsCatalog('NonExistentTag');

			expect(result).toBeNull();
		});

		it('should be case sensitive when searching by name', async () => {
			(TagDAO.getTagByNameFromTagsCatalog as jest.Mock).mockResolvedValue(
				null
			);

			const result = await TagService.getTagByNameFromTagsCatalog(
				'algoritmos y complejidad'
			);

			expect(TagDAO.getTagByNameFromTagsCatalog).toHaveBeenCalledWith(
				'algoritmos y complejidad'
			);
			expect(result).toBeNull();
		});

		it('should handle special characters in tag names', async () => {
			const mockTag: Tag = {
				tagId: '1',
				tagName: 'Bases de Datos',
				createdAt: new Date(),
				updatedAt: new Date(),
				softDelete: false,
			};

			(TagDAO.getTagByNameFromTagsCatalog as jest.Mock).mockResolvedValue(
				mockTag
			);

			const result =
				await TagService.getTagByNameFromTagsCatalog('Bases de Datos');

			expect(result?.tagName).toBe('Bases de Datos');
		});

		it('should handle empty string as tag name', async () => {
			(TagDAO.getTagByNameFromTagsCatalog as jest.Mock).mockResolvedValue(
				null
			);

			const result = await TagService.getTagByNameFromTagsCatalog('');

			expect(TagDAO.getTagByNameFromTagsCatalog).toHaveBeenCalledWith('');
			expect(result).toBeNull();
		});

		it('should return tag with all fields populated', async () => {
			const mockTag: Tag = {
				tagId: '1',
				tagName: 'Herramientas de Software',
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-15'),
				softDelete: false,
			};

			(TagDAO.getTagByNameFromTagsCatalog as jest.Mock).mockResolvedValue(
				mockTag
			);

			const result = await TagService.getTagByNameFromTagsCatalog(
				'Herramientas de Software'
			);

			expect(result?.tagId).toBe('1');
			expect(result?.tagName).toBe('Herramientas de Software');
			expect(result?.createdAt).toEqual(new Date('2024-01-01'));
			expect(result?.updatedAt).toEqual(new Date('2024-01-15'));
			expect(result?.softDelete).toBe(false);
		});

		it('should not return soft deleted tags', async () => {
			(TagDAO.getTagByNameFromTagsCatalog as jest.Mock).mockResolvedValue(
				null
			);

			const result =
				await TagService.getTagByNameFromTagsCatalog('DeletedTag');

			expect(result).toBeNull();
		});
	});
});
