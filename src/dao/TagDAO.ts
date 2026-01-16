import { Tag } from '@/model/Tags';
import Database from '@/database/Database';
import { PoolClient } from 'pg';
import { constructFromSymbol } from 'date-fns/constants';

const pool = Database.getInstance();

export class TagDAO {
	static async getAllTagsByPostId(postId: number): Promise<Tag[]> {
		const query = `SELECT * FROM "PostTags" WHERE "postId" = $1 "SoftDelete" = false`;
		const result = await pool.query(query, [postId]);
		return result.rows;
	}

	static async getTagById(id: number): Promise<Tag | null> {
		const query = `SELECT * FROM "PostTags" WHERE "postTagId" = $1 AND "SoftDelete" = false`;
		const result = await pool.query(query, [id]);
		if (result.rows.length > 0) {
			return result.rows[0];
		}
		return null;
	}

	static async createTag(name: string, postId?: string): Promise<Tag> {
		const tagExistsQuery = `
			SELECT * FROM "Tags"
			WHERE "tagName" = $1
		`;

		const tagInDictionary = await Database.session(
			async (client: PoolClient) => {
				const result = await client.query(tagExistsQuery, [name]);
				return (result.rowCount ?? 0) > 0;
			}
		);

		if (!tagInDictionary) {
			throw new Error(
				`La etiqueta "${name}" no existe en la tabla "Tags" y no puede ser utilizada.`
			);
		}

		// Insertar en PostTags
		const tagQuery = `
			INSERT INTO "PostTags" (name)
			VALUES ($1)
			RETURNING *;
		`;

		const response = await Database.session(async (client: PoolClient) => {
			const tagResult = await client.query(tagQuery, [name]);
			const tag = tagResult.rows[0];
			return tag;
			// If there is a postId, add the relationship in PostTags
		});

		await Database.session(async (client: PoolClient) => {
			const postTagQuery = `
				INSERT INTO "PostHasTags" ("postId", "postTagId")
				VALUES ($1, $2)
				ON CONFLICT DO NOTHING;
			`;
			if (postId) {
				await client.query(postTagQuery, [postId, response.postTagId]);
			}
		});

		return response;
	}

	static async updateTag(id: number, name: string): Promise<Tag | null> {
		const query = `UPDATE "PostTags" SET name = $1 WHERE id = $2 RETURNING *`;
		const result = await pool.query(query, [name, id]);
		if (result.rows.length > 0) {
			return result.rows[0];
		}
		return null;
	}

	static async deleteTag(postTagId?: string): Promise<boolean> {
		const query = `UPDATE "PostTags" SET "softDelete" = true WHERE "postTagId" = $1`;
		const result = await pool.query(query, [postTagId]);
		return (
			result !== null && result.rowCount !== null && result.rowCount > 0
		);
	}

	static async deleteAllTags(postId?: string): Promise<boolean> {
		const query = `UPDATE "PostHasTags" SET "softDelete" = true WHERE "postId" = $1`;
		const result = await pool.query(query, [postId]);
		return (
			result !== null && result.rowCount !== null && result.rowCount > 0
		);
	}

	// Obtener todas las etiquetas del "Catalogo" de etiquetas
	static async getAllTagsCatalog(): Promise<{ label: string }[]> {
		const query = `SELECT * FROM "Tags" ORDER BY "tagName" ASC`;
		const res = await pool.query(query);
		return res.rows.map((row) => ({
			label: row.tagName,
			...row,
		}));
	}

	// Obtener una etiqueta por nombre del "Catalogo" de etiquetas
	static async getTagByNameFromTagsCatalog(
		name: string
	): Promise<Tag | null> {
		const query = `SELECT * FROM "Tags" WHERE tagName = $1 LIMIT 1`;
		const values = [name];
		const res = await pool.query(query, values);
		return res.rows[0] || null;
	}
}
