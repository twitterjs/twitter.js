import { runGenerator } from '@discordjs/ts-docgen';

runGenerator({
	existingOutput: 'docs/typedoc-out.json',
	output: 'docs/docs.json',
});
