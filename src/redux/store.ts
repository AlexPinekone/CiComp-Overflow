import { configureStore } from '@reduxjs/toolkit';
import { commentsApi } from '@/redux/services/commentsApi';
import { postsApi } from '@/redux/services/postsApi';

export const store = configureStore({
	reducer: {
		[commentsApi.reducerPath]: commentsApi.reducer,
		[postsApi.reducerPath]: postsApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			commentsApi.middleware,
			postsApi.middleware
		),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
