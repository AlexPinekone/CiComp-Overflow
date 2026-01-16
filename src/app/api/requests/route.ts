import { RequestController } from '@/controller/RequestController';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);

	const type = searchParams.get('type') || 'post';
	const page = parseInt(searchParams.get('page') || '1', 10);
	const limit = parseInt(searchParams.get('limit') || '10', 10);

	return RequestController.getRequestsPaginated(type, page, limit);
}

export async function POST(request: NextRequest) {
	return RequestController.createRequest(request);
}

export async function PUT(request: NextRequest) {
	return RequestController.updateRequestStatus(request);
}

export async function DELETE(request: NextRequest) {
	return RequestController.deleteRequest(request);
}
