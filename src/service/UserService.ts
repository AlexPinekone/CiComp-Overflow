import { AccountDAO } from '@/dao/AccountDAO';
import { ProfileDAO } from '@/dao/ProfileDAO';
import { UserDAO } from '@/dao/UserDAO';

export class UserService {
	static async getUserByMail({ mail }: any) {
		const account = await AccountDAO.getAccountByMail({ mail });
		if (!account) {
			return null;
		}
		const user = await UserDAO.getUserById(account.userId);
		if (!user) {
			return null;
		}

		const profile = await ProfileDAO.getProfileByUserId(user.userId);
		if (!profile) {
			return null;
		}
		return {
			account,
			user,
			profile,
		};
	}

	static async registerUser({ name, lastName, mail, password, role }: any) {
		try {
			await this.getUserByMail({ mail });

			throw new Error(
				'El correo electrónico ya está en uso. Por favor, utiliza otro.'
			);
		} catch (err: any) {
			if (err.message !== 'Account not found') {
				throw err;
			}
		}

		const user = await UserDAO.registerUser({ name, lastName, role });
		const profile = await ProfileDAO.registerProfile(user.userId);
		const account = await AccountDAO.registerAccount({
			userId: user.userId,
			mail,
			password,
		});

		return { user, profile, account };
	}

	static async getUserPostsById(id: string) {
		return await UserDAO.getUserPostsById(id);
	}

	static async getUserPostsByIdPaginated(
		userId: string,
		orderBy: 'newest' | 'oldest',
		page: number,
		limit: number
	) {
		return await UserDAO.getUserPostsByIdPaginated(
			userId,
			orderBy,
			page,
			limit
		);
	}

	static async countActiveUsers(): Promise<number> {
		return await UserDAO.countActiveUsers();
	}
}
