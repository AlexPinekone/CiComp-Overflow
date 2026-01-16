import { ProfileDAO } from '@/dao/ProfileDAO';
import { UserDAO } from '@/dao/UserDAO';
import { decrypt } from '@/lib/session';
import { Profile } from '@/model/Profile';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { NextRequest, NextResponse } from 'next/server';
import CloudinaryService from './CloudinaryService';
import { UserRole } from '@/constants/session';

export class ProfileService {
	static async getAllProfiles(): Promise<Profile[]> {
		return await ProfileDAO.getProfiles();
	}

	static async getProfileById(userId: string): Promise<Profile | null> {
		return await ProfileDAO.getProfileByUserId(userId);
	}

	static async updateProfileStatus(
		profileId: string,
		status: string
	): Promise<Profile | null> {
		return await ProfileDAO.updateProfileStatus(profileId, status);
	}

	static async registerProfile(userId: string): Promise<Profile> {
		return await ProfileDAO.registerProfile(userId);
	}

	static async getUserProfileBySession(req: NextRequest) {
		try {
			const id = req.nextUrl.searchParams.get('id');
			const token = req.headers.get('Authorization');
			if (!token) {
				return NextResponse.json(
					{ error: 'Missing authorization token' },
					{ status: 401 }
				);
			}
			const payload = await decrypt(token);
			if (!payload) {
				return NextResponse.json(
					{ error: 'Invalid token' },
					{ status: 401 }
				);
			}

			const sessionRole = payload.role as string;
			const sessionId = payload.userId as string;

			const { userName, photo, description } =
				(await ProfileDAO.getProfileByUserId(id ?? sessionId)) ?? {};
			const {
				name,
				lastName,
				userId: dataId,
				role: dataRole,
			} = (await UserDAO.getUserById(id ?? sessionId)) ?? {};

			const role = sessionRole === 'admin' ? dataRole : sessionRole;
			const userId = sessionRole === 'admin' ? dataId : sessionId;

			return NextResponse.json(
				{ userName, photo, description, name, lastName, role, userId },
				{ status: 200 }
			);
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async updateProfile(req: NextRequest) {
		try {
			const token = req.headers.get('Authorization');
			if (!token) throw new Error('Missing authorization token');

			const payload = await decrypt(token);
			if (!payload) throw new Error('Invalid token');

			const sessionUserId = payload.userId as string;
			const formData = await req.formData();

			const userName = formData.get('userName') as string;
			const photoFile = formData.get('photo') as File | null;
			const description = formData.get('description') as string;

			let userIdToUpdate: string;
			if (payload.role === UserRole.ADMIN) {
				userIdToUpdate =
					(formData.get('userId') as string) || sessionUserId;
			} else {
				userIdToUpdate = sessionUserId;
			}

			let urlPhoto: string | undefined;
			if (photoFile && photoFile.size > 0) {
				const result = await CloudinaryService.uploadImage(photoFile, {
					folder: 'profile',
					public_id: userIdToUpdate,
					overwrite: true,
				});
				if (result.error) {
					return NextResponse.json(
						{ error: 'Error uploading image' },
						{ status: 500 }
					);
				}
				urlPhoto = result.secure_url;
			}

			if (userName) {
				const userNameExists = await ProfileService.checkUserNameExists(
					userName,
					userIdToUpdate
				);
				if (userNameExists) {
					return NextResponse.json(
						{
							error: 'El nombre de usuario ya está en uso. Intente con otro.',
						},
						{ status: 409 }
					);
				}
			}

			const updatedProfile = await ProfileDAO.updateProfile({
				userId: userIdToUpdate,
				userName,
				photo: urlPhoto,
				description,
			});

			return NextResponse.json(updatedProfile, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	private static async checkUserNameExists(
		userName: string,
		excludeUserId?: string
	): Promise<boolean> {
		const existingProfile = await ProfileDAO.getProfileByUserName(userName);

		if (!existingProfile) {
			return false;
		}

		if (excludeUserId && existingProfile.userId === excludeUserId) {
			return false;
		}

		return true;
	}
}
