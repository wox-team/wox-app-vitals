import debug from 'debug';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Console } from 'node:console';
import { Transform } from 'node:stream';
import { Options } from 'tinybench';

const USE_OUTPUT = debug('use:output').enabled;

// Configuring benchmark options based on the USE_OUTPUT flag.
const opt: Options = USE_OUTPUT ? { warmupTime: 100, iterations: 25 } : { time: 100 };

const benchEntities = [/* noop */];

for (const entity of benchEntities) {
	await entity.bench.run();
}

// If debug output is enabled, write the benchmark results to a file.
if (USE_OUTPUT) {
	// Getting the directory name of the current script, it should be `__dirname` but idk wtf up with node.
	const dirname = path.dirname(fileURLToPath(import.meta.url));

	// Generating a file path with the current date as part of the filename.
	const now = new Date();
	const dateStr = now.toISOString().slice(0, 10);
	let filePath = dirname + '/results/' + dateStr;

	// Creating a custom console output using a Transform stream to capture the benchmark results.
	const stream = new Transform({
		transform(chunk, _, cb) {
			cb(null, chunk);
		},
	});
	const customConsole = new Console({ stdout: stream });

	print(customConsole);

	// Extracting the benchmark results from the buffer and converting to a string.
	const output = stream.read()?.toString() ?? 'No data...';

	// Handling potential file name conflicts by appending '(copy)' to the filename.
	while (fs.existsSync(filePath)) {
		filePath += ' (copy)';
	}

	fs.writeFileSync(filePath, output);

	console.log('wrote file ' + filePath);
} else {
	// If debug output is not enabled, display the benchmark results in the console.
	print(console);
}

function print(console: Console): void {
	benchEntities.forEach((e, i) => {
		console.log('Results from: ' + e.title);
		console.table(e.bench.table());

		if (i !== benchEntities.length - 1) {
			console.log('\n');
		}
	});
}
