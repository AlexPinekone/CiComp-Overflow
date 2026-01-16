import { NextResponse } from 'next/server';

export class ErrorHandler {
	static handle(error: any) {
		console.error(error);

		if (error.name === 'ValidationError') {
			return NextResponse.json(
				{ error: 'Validation error', details: error.message },
				{ status: 400 }
			);
		}

		if (error.name === 'NotFoundError') {
			return NextResponse.json(
				{ error: 'Resource not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
