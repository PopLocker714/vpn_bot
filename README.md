# vpn_next

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.


## Generate sicret

```bash
bun -e "
const bytes = new Uint8Array(64)
crypto.getRandomValues(bytes)
console.log(Buffer.from(bytes).toString('base64url'))
"
```
