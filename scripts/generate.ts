import { ColorTranslator } from "colortranslator";
import tailwindColors from "tailwindcss/colors.js";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Generate Tailwind CSS compatible CSS color variables.
 */
function main() {
	generateTailwindColorVariables();
}

main();

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
	let css = ``;

	// Open :root scope.
	css += `:root {\n`;

	// Append single scale color variables.
	for (const color in singleScaleColors) {
		ts += `/** ${color} */\n`;
		css += `\t/* ${color} */\n`;

		const colorValue =
			singleScaleColors[color as keyof typeof singleScaleColors];
		const translator = new ColorTranslator(colorValue);
		const variableValue = `${translator.H}deg ${translator.S}% ${translator.L}%`;

		ts += `export const ${color} = "hsl(${variableValue} / <alpha-value>)" as const;\n`;
		css += `\t--color-${color}: ${variableValue};\n`;
	}

	// Append color variables.
	for (const color in colors) {
		const colorValue = colors[color as keyof typeof colors];

		ts += `/** ${color} */\n`;
		ts += `export const ${color} = {\n`;
		css += `\t/* ${color} */\n`;

		for (const scale in colorValue) {
			const scaleValue = colorValue[scale as keyof typeof colorValue];
			const translator = new ColorTranslator(scaleValue);
			const variableValue = `${translator.H}deg ${translator.S}% ${translator.L}%`;

			ts += `\t${scale}: "hsl(${variableValue} / <alpha-value>)",\n`;
			css += `\t--color-${color}-${scale}: ${variableValue};\n`;
		}

		ts += `} as const;\n`;
	}

	// Close :root scope.
	css += `}\n`;

	writeFileSync({ content: ts, relativePath: "./src/tailwind.ts" });
	writeFileSync({ content: css, relativePath: "./dist/css/tailwind.css" });
}

function writeFileSync({
	content,
	relativePath,
}: {
	content: string;
	relativePath: string;
}) {
	const absolutePath = path.resolve(process.cwd(), relativePath);
	const dirname = path.dirname(absolutePath);

	const isDirectoryExist = fs.existsSync(dirname);
	if (!isDirectoryExist) fs.mkdirSync(dirname, { recursive: true });

	fs.writeFileSync(absolutePath, content, { encoding: "utf-8" });
}
