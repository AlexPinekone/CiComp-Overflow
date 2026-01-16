import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feat',
				'fix',
				'chore',
				'docs',
				'style',
				'refactor',
				'test',
				'revert',
				'ci',
				'build',
				'perf',
			],
		],
		'subject-case': [2, 'always', 'sentence-case'],
		'scope-empty': [2, 'never'],
		'scope-enum': [2, 'always', ['frontend', 'backend', 'common']],
		'body-empty': [2, 'never'],
	},
};

export default Configuration;
