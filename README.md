# BabyJS

Site: [BabyJS](https://babyjs.vercel.app/)

This is an ongoing project to build a programming language by following along with the amazing book [Crafting Interpreters](https://craftinginterpreters.com/).

As I'm most comfortable in Typescript + React + Nextjs, and the focus is on mulling over the nuances of designing a programming language, This the programming language in question will be basically a rehash of Javascript, but only the parts that like and that don't give me too many footguns.

BabyJS is also integrated into my [blog site](https://prng-v3.vercel.app/) with the hopes that I could find a way to turn it into my search interface in the near future.

## wishlist

- in functions, can i haz a: `array.swapIndex(idxOne, idxTwo)`
- can i make it easier to clarify off-by-one issues?
  - maybe in functions, descriptions indicate whether its inclusive or exclusive?
    - also explain what inclusive and exclusive means?
- an we always create a function graph during interpretation, so that when an error stack happens, we show the graph?
- in recursive functions, can we have a visualization? just boxes pointing to other boxes (linkedlist-like)

## how to deal with nulls

ref: `https://medium.com/free-code-camp/a-quick-and-thorough-guide-to-null-what-it-is-and-how-you-should-use-it-d170cea62840#:~:text=Note%3A%20Some%20programming%20languages%20(mostly,value'%20case%20is%20handled%20explicitly.`

```js
const SENTINEL_VALUES = ['uninitialized', 'empty_function_return']
// unitialized
emailaddress = null; // you mean you don't know the emailaddress yet. -> uninitialized

// its not giving me back anything
function() {}; // you mean your function is just side effects, you're not returning anything from the function to pass in

function procedure() { print "don't return anything"; }
var result = procedure(); // -> should throw error here
print result;

// TODO: what about functions with early returns?
fn early(num) {
  if (num != 1) return;
  return num;
}

// allowed
let one = early(1);
print one;

// this is allowed
early(2);

// not allowed
let two = early(2);
print two;

// closures
fn makeCounter() {
  let i = 0;
  fn count() {
    i = i + 1;
    print i;
  }

  return count;
}

let counter = makeCounter();
counter(); // "1".
counter(); // "2".


// TODO: explore this
// In data structures like trees, linked lists, or optional fields in structures/classes, the absence of a value is traditionally represented by null. Alternative representations might be less efficient or intuitive.
```

## NextJS setup

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
