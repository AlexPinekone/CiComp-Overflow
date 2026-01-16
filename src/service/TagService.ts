import { TagDAO } from '@/dao/TagDAO';
import { Tag } from '@/model/Tags';

export class TagService {
	static async getAllTagsCatalog(): Promise<{ label: string }[]> {
		return await TagDAO.getAllTagsCatalog();
	}

	static async getTagByNameFromTagsCatalog(
		name: string
	): Promise<Tag | null> {
		return await TagDAO.getTagByNameFromTagsCatalog(name);
	}
}
