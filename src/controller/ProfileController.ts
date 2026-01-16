import { ProfileService } from '@/service/ProfileService';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { NextRequest, NextResponse } from 'next/server';

export class ProfileController {
	static async getAllProfiles() {
		try {
			const profiles = await ProfileService.getAllProfiles();
			return NextResponse.json(profiles, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getProfileById(id: string) {
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid profile ID' },
				{ status: 400 }
			);
		}

		try {
			const profile = await ProfileService.getProfileById(id);
			if (!profile) {
				return NextResponse.json(
					{ error: 'Profile not found' },
					{ status: 404 }
				);
			}
			return NextResponse.json(profile, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async updateProfileStatus(req: NextRequest, profileId: string) {
		if (!profileId) {
			return NextResponse.json(
				{ error: 'Invalid profile ID' },
				{ status: 400 }
			);
		}

		try {
			const { status } = await req.json();

			if (!status) {
				return NextResponse.json(
					{ error: 'Missing status value' },
					{ status: 400 }
				);
			}

			const updatedProfile = await ProfileService.updateProfileStatus(
				profileId,
				status
			);
			return NextResponse.json(updatedProfile, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async registerProfile(req: NextRequest) {
		try {
			const { userId } = await req.json();

			if (!userId) {
				return NextResponse.json(
					{ error: 'Missing userId' },
					{ status: 400 }
				);
			}

			const newProfile = await ProfileService.registerProfile(userId);
			return NextResponse.json(newProfile, { status: 201 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getProfileByUserSession(req: NextRequest) {
		return await ProfileService.getUserProfileBySession(req);
	}

	static async updateProfile(req: NextRequest) {
		return await ProfileService.updateProfile(req);
	}
}
