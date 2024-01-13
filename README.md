# Tailwind CSS Color Variables

CSS color variables that are compatible with Tailwind CSS color opacity syntax.

## Usage

Import CSS variables of the colors that you want. If you are using Vite:

```javascript
/**
 * file: ./src/main.js
 */

import "@izznatsir/tailwindcss-colors/radix/gray.css";
import "@izznatsir/tailwindcss-colors/tailwind/sky.css";
```

Update your `tailwind.config.js` to use the variables:

```javascript
/**
 * file: .tailwind.config.js
 */

import { gray } from "@izznatsir/tailwindcss-colors/radix";
import { sky } from "@izznatsir/tailwindcss-colors/tailwind";

export default {
  ...
  theme: {
    colors: {
      gray,
      sky,
      // Semantic aliases.
      bg: gray[1],
      highlight: sky[100]
    }
  }
  ...
}
```
