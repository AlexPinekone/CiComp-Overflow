import { NextRequest, NextResponse } from 'next/server';
import { RequestService } from '@/service/RequestService';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { request } from 'http';

export class RequestController {
	static async getRequestsPaginated(
		type: string,
		page: number,
		limit: number
	) {
		try {
			const result = await RequestService.getRequestsPaginated(
				type,
				page,
				limit
			);
			return NextResponse.json(result, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async getRequestById(id: string) {
		if (!id) {
			return NextResponse.json(
				{ error: 'Invalid request ID' },
				{ status: 400 }
			);
		}

		try {
			const request = await RequestService.getRequestById(id);
			if (!request) {
				return NextResponse.json(
					{ error: 'Request not found' },
					{ status: 404 }
				);
			}
			return NextResponse.json(request, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async createRequest(req: NextRequest) {
		try {
			const {
				userId,
				body,
				title,
				status,
				type,
				referencePostId,
				referenceCommentId,
				referenceUserId,
			} = await req.json();

			if (!userId || !status || !type) {
				return NextResponse.json(
					{ error: 'Missing required fields' },
					{ status: 400 }
				);
			}

			const newRequest = await RequestService.createRequest({
				userId,
				body,
				title,
				type,
				status,
				referencePostId,
				referenceCommentId,
				referenceUserId,
			});

			return NextResponse.json(newRequest, { status: 201 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async updateRequestStatus(req: NextRequest) {
		try {
			const { id, status } = await req.json();

			if (!id) {
				return NextResponse.json(
					{ error: 'Invalid request ID' },
					{ status: 400 }
				);
			}

			if (!status) {
				return NextResponse.json(
					{ error: 'Status is required' },
					{ status: 400 }
				);
			}

			const updatedRequest = await RequestService.updateRequestStatus(
				id,
				status
			);
			return NextResponse.json(updatedRequest, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async deleteRequest(req: NextRequest) {
		const body = await req.json();
		const { requestId, status } = body;

		if (!requestId) {
			return NextResponse.json(
				{ error: 'Invalid request ID' },
				{ status: 400 }
			);
		}

		try {
			await RequestService.deleteRequest(requestId, status);
			return new NextResponse(null, { status: 204 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}

	static async countAllRequests() {
		try {
			const count = await RequestService.countAllRequests();
			return NextResponse.json({ count }, { status: 200 });
		} catch (error) {
			return ErrorHandler.handle(error);
		}
	}
}
