enum LogLevel {
	Verbose = 64,
	Debug = 32,
	Information = 16,
	Warning = 8,
	Error = 4,
	Fatal = 2,
	None = 0,
}

class Channel {
	constructor(private readonly stdout: (...params: any) => void) {
		// Empty
	}

	print(msg: Message): void {
		this.stdout(this.parseMessage(msg));
	}

	private parseMessage(msg: Message): string {
		let extractedDataIndex = 0;

		let result = '';
		let walkerIndex = 0;
		while (walkerIndex < msg.template.length) {
			const openBraceIndex = msg.template.indexOf('{', walkerIndex);
			if (openBraceIndex === -1) {
				result += msg.template.slice(walkerIndex);
				break;
			}

			const closeBraceIndex = msg.template.indexOf('}', openBraceIndex + 1);
			if (closeBraceIndex === -1) {
				result += msg.template.slice(walkerIndex);
				break;
			}

			result += msg.template.slice(walkerIndex, openBraceIndex);
			// const key = msg.template.slice(openBraceIndex + 1, closeBraceIndex);
			result += msg.data[extractedDataIndex];
			extractedDataIndex++;

			walkerIndex = closeBraceIndex + 1;
		}

		return ['[' + new Date(msg.timestamp).toLocaleTimeString(navigator.language) + ']', this.getCtxSection(msg), result]
			.filter(Boolean)
			.join(' ');
	}

	private getCtxSection(msg: Message): string | null {
		if (!msg.ctx) return null;

		const MAX_LENGTH = 15;

		let str = '[' + msg.ctx + ']';
		if (msg.ctx.length < MAX_LENGTH) {
			str = str.padEnd(MAX_LENGTH + 2, ' ');
		}

		return str;
	}
}

class Runtime {
	#messages: Message[] = [];
	#isScheduledToPrint = false;
	#printIndex = 0;

	public level = LogLevel.Verbose;
	public channel = new Channel((str) => {
		console.log('%c ' + str, 'color: #1ca8fa');
	});

	public enqueue(msg: Message): void {
		this.#messages.push(msg);

		if (this.#isScheduledToPrint) return;

		this.#isScheduledToPrint = true;

		queueMicrotask(() => {
			this.walk();
			this.#isScheduledToPrint = false;
		});
	}

	private walk(): void {
		while (this.#printIndex < this.#messages.length) {
			const msg = this.#messages[this.#printIndex];
			this.#printIndex++;

			if (msg.level > this.level) return;

			this.channel.print(msg);
		}
	}
}

interface Message {
	timestamp: number;
	ctx: string | null;
	level: LogLevel;
	template: string;
	data: string[];
}

export class Logger {
	private static runtime = new Runtime();

	constructor(private readonly ctx: string | null = null) {
		// Empty
	}

	public logVerbose(strTemplate: string, ...params: string[]): void {
		this.createMessage(LogLevel.Verbose, strTemplate, ...params);
	}

	public logDebug(strTemplate: string, ...params: string[]): void {
		this.createMessage(LogLevel.Debug, strTemplate, ...params);
	}

	public logInformation(strTemplate: string, ...params: string[]): void {
		this.createMessage(LogLevel.Information, strTemplate, ...params);
	}

	public logWarning(strTemplate: string, ...params: string[]): void {
		this.createMessage(LogLevel.Warning, strTemplate, ...params);
	}

	public logError(strTemplate: string, ...params: string[]): void {
		this.createMessage(LogLevel.Error, strTemplate, ...params);
	}

	public logFatal(strTemplate: string, ...params: string[]): void {
		this.createMessage(LogLevel.Fatal, strTemplate, ...params);
	}

	private createMessage(level: LogLevel, template: string, ...params: string[]): void {
		const message = {
			timestamp: Date.now(),
			ctx: this.ctx,
			level,
			template,
			data: params,
		};

		Logger.runtime.enqueue(message);
	}
}
