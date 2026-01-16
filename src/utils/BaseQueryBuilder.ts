export type SqlBuilt = { sql: string; params: any[] };

export abstract class BaseQueryBuilder<TSelf extends BaseQueryBuilder<any>> {
	protected params: any[] = [];
	protected where: string[] = [];
	protected orderBySql = '';
	protected limitSql = '';
	protected offsetSql = '';

	protected pushParam(val: any) {
		this.params.push(val);
		return `$${this.params.length}`;
	}

	/** Encadenable: agrega condición WHERE */
	whereRaw(clause: string): TSelf {
		if (clause.trim()) this.where.push(`(${clause})`);
		return this as unknown as TSelf;
	}

	/** Encadenable: ORDER BY (valida internamente en la subclase) */
	orderBy(raw: string): TSelf {
		this.orderBySql = raw;
		return this as unknown as TSelf;
	}

	limit(n: number): TSelf {
		if (Number.isFinite(n)) this.limitSql = ` LIMIT ${n} `;
		return this as unknown as TSelf;
	}

	offset(n: number): TSelf {
		if (Number.isFinite(n)) this.offsetSql = ` OFFSET ${n} `;
		return this as unknown as TSelf;
	}

	protected buildWhere(): string {
		return this.where.length ? `WHERE ${this.where.join(' AND ')}` : '';
	}

	/** Cada subclase define su SELECT completo */
	abstract build(): SqlBuilt;
}
