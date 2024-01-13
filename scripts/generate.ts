import radixColors from "@radix-ui/colors";
import { ColorTranslator } from "colortranslator";
import tailwindColors from "tailwindcss/colors.js";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Generate Tailwind CSS compatible CSS color variables.
 */
function main() {
	generateRadixColorVariables();
	generateTailwindColorVariables();
}

main();

/**
 * Generate Tailwind color variables.
 */
function generateTailwindColorVariables() {
	const {
		black,
		white,
		blueGray: _,
		coolGray: __,
		current: ___,
		inherit: ____,
		lightBlue: _____,
		transparent: ______,
		trueGray: _______,
		warmGray: ________,
		...colors
	} = tailwindColors;
	const singleScaleColors = { black, white };

	let ts = ``;

	// Append single scale color variables.
	for (const color in singleScaleColors) {
		let css = ``;

		ts += `/** ${color} */\n`;

		css += `:root {\n`;
		css += `\t/* ${color} */\n`;

		const colorValue =
			singleScaleColors[color as keyof typeof singleScaleColors];
		const translator = new ColorTranslator(colorValue);
		const variableValue = `${translator.H}deg ${translator.S}% ${translator.L}%`;

		ts += `export const ${color} = "hsl(${variableValue} / <alpha-value>)" as const;\n`;

		css += `\t--color-${color}: ${variableValue};\n`;
		css += `}\n`;

		writeFileSync({
			content: css,
			relativePath: `./dist/css/tailwind/${color}.css`,
		});
	}

	// Append color variables.
	for (const color in colors) {
		const colorValue = colors[color as keyof typeof colors];

		let css = ``;

		ts += `/** ${color} */\n`;
		ts += `export const ${color} = {\n`;

		css += `:root {\n`;
		css += `\t/* ${color} */\n`;

		for (const scale in colorValue) {
			const scaleValue = colorValue[scale as keyof typeof colorValue];
			const translator = new ColorTranslator(scaleValue);
			const variableName = `--color-${color}-${scale}`;
			const variableValue = `${translator.H}deg ${translator.S}% ${translator.L}%`;

			ts += `\t${scale}: "hsl(var(${variableName}) / <alpha-value>)",\n`;
			css += `\t${variableName}: ${variableValue};\n`;
		}

		ts += `} as const;\n`;
		css += `}\n`;

		writeFileSync({
			content: css,
			relativePath: `./dist/css/tailwind/${color}.css`,
		});
	}

	writeFileSync({ content: ts, relativePath: "./src/tailwind.ts" });
}

/**
 * Generate Radix color variables.
 */
function generateRadixColorVariables() {
	const colors = radixColors;

	let ts = ``;

	// Append color variables.
	for (const colorWithDark in colors) {
		if (/P3A?$/.test(colorWithDark)) continue;

		const color = colorWithDark.replace("Dark", "");

		const isDark = /DarkA?$/.test(colorWithDark);
		const isAlpha = /A$/.test(color);

		const colorValue = colors[colorWithDark as keyof typeof colors];

		let css = ``;

		if (!isDark) {
			ts += `/** ${color} */\n`;
			ts += `export const ${color} = {\n`;
		}

		if (!isDark) {
			css += `:root {\n`;
		} else {
			css += `:root.dark {\n`;
		}
		css += `\t/* ${colorWithDark} */\n`;

		for (let colorWithScale in colorValue) {
			const scale = colorWithScale.replace(color, "");

			const scaleValue = colorValue[colorWithScale as keyof typeof colorValue];
			const translator = new ColorTranslator(scaleValue);
			const variableName = `--color-${color}-${scale}`;
			let variableValue = `${translator.H}deg ${translator.S}% ${translator.L}%`;

			if (isAlpha) variableValue += ` / ${translator.A}`;

			if (!isDark) {
				ts += `\t${scale}: "hsl(var(${variableName})`;
				ts += isAlpha ? `)",\n` : ` / <alpha-value>)",\n`;
			}
			css += `\t${variableName}: ${variableValue};\n`;
		}

		if (!isDark) {
			ts += `} as const;\n`;
		}
		css += `}\n`;

		writeFileSync({
			content: css,
			relativePath: `./dist/css/radix/${color}.css`,
			mode: !isDark ? "write" : "append",
		});
	}

	writeFileSync({ content: ts, relativePath: "./src/radix.ts" });
}

/**
 * Safely write file synchronously.
 */
function writeFileSync({
	content,
	relativePath,
	mode,
}: {
	content: string;
	relativePath: string;
	mode?: "append" | "write";
}) {
	const absolutePath = path.resolve(process.cwd(), relativePath);
	const dirname = path.dirname(absolutePath);

	const isDirectoryExist = fs.existsSync(dirname);
	if (!isDirectoryExist) fs.mkdirSync(dirname, { recursive: true });

	if (mode === "append") {
		fs.appendFileSync(absolutePath, content, { encoding: "utf-8" });
	} else {
		fs.writeFileSync(absolutePath, content, { encoding: "utf-8" });
	}
}
