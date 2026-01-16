// query-builder/PostQueryBuilder.ts
import { PostOrderKey } from '@/constants/post';
import { BaseQueryBuilder, SqlBuilt } from './BaseQueryBuilder';

export class PostQueryBuilder extends BaseQueryBuilder<PostQueryBuilder> {
	private readonly alias = 'p';
	private readonly orderMap: Record<PostOrderKey, string> = {
		newest: `${this.alias}."createdAt" DESC`,
		oldest: `${this.alias}."createdAt" ASC`,
		votes: `COALESCE(v."voteCount",0) DESC, ${this.alias}."createdAt" DESC`,
	};

	/** Siempre presente: ORDER BY con whitelist */
	setOrderBy(key: PostOrderKey) {
		this.orderBy(this.orderMap[key] ?? this.orderMap.newest);
		return this;
	}

	/** Filtro: softDelete = false (default) */
	onlyActive() {
		return this.whereRaw(`${this.alias}."softDelete" = false`);
	}

	/** Filtro: fecha inicio */
	startDate(d: Date) {
		const p = this.pushParam(d);
		return this.whereRaw(`${this.alias}."createdAt" >= ${p}`);
	}

	/** Filtro: fecha fin */
	endDate(d: Date) {
		const p = this.pushParam(d);
		return this.whereRaw(`${this.alias}."createdAt" <= ${p}`);
	}

	/** Filtro: por tag usando EXISTS (no rompe agregados) */
	tag(tagName: string) {
		const p = this.pushParam(tagName);
		return this.whereRaw(`
      EXISTS (
        SELECT 1
        FROM "PostHasTags" pht
        JOIN "PostTags" t ON t."postTagId" = pht."postTagId"
        WHERE pht."postId" = ${this.alias}."postId"
          AND pht."softDelete" = false
          AND t.name = ${p}
      )
    `);
	}

	/** SELECT final: usa CTEs pequeños para votos y tags */
	build(): SqlBuilt {
		const where = this.buildWhere();
		const order = this.orderBySql ? `ORDER BY ${this.orderBySql}` : '';

		const sql = `
      WITH votes AS (
        SELECT upv."postId",
               COALESCE(SUM(CASE
                 WHEN upv.status = 'UPVOTE' THEN 1
                 WHEN upv.status = 'DOWNVOTE' THEN -1
                 ELSE 0 END), 0) AS "voteCount",
               COALESCE(SUM(CASE
                 WHEN upv.status = 'UPVOTE' THEN 1
                 ELSE 0 END), 0) AS "upVoteCount",
               COALESCE(SUM(CASE
                 WHEN upv.status = 'DOWNVOTE' THEN 1
                 ELSE 0 END), 0) AS "downVoteCount"
        FROM "UserPostVotes" upv
        WHERE upv."softDelete" = false
        GROUP BY upv."postId"
      ),
      tags AS (
        SELECT pht."postId",
               ARRAY_AGG(DISTINCT t.name) AS tags
        FROM "PostHasTags" pht
        JOIN "PostTags" t ON t."postTagId" = pht."postTagId"
        WHERE pht."softDelete" = false
        GROUP BY pht."postId"
      )
      SELECT
        ${this.alias}.*,
        pr."userName",
        COALESCE(v."voteCount",0) AS "voteCount",
        COALESCE(v."upVoteCount",0) AS "upVoteCount",
        COALESCE(v."downVoteCount",0) AS "downVoteCount",
        COALESCE(tg.tags,'{}') AS tags
      FROM "Posts" ${this.alias}
      LEFT JOIN votes v ON v."postId" = ${this.alias}."postId"
      LEFT JOIN tags  tg ON tg."postId" = ${this.alias}."postId"
      LEFT JOIN "Profiles" pr ON pr."userId" = ${this.alias}."userId"
      ${where}
      ${order}
      ${this.limitSql}
      ${this.offsetSql}
    `;
		return { sql, params: this.params };
	}
}
