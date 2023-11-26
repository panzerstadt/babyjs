## an exploration in removing null values in a language

## goals

achieve the equivalent of "support(ing) compile-time null-safety." in an interpreted language. what does that mean? I don't know yet! but I'm finding this out iteratively by first removing null, and making all attempts to prevent it from being introduced.

perhaps we end up with a linter, like typescript, that warns (or blocks) null usage when it finds it?

perhaps we integrate this 'linting' into a step between parsing and interpreting, where we warn users of nulls or unitialized values?

the whole point of preventing nulls is not allowing the user to run the code if we know there are nulls being passed around. for an interpreted language, where does this line happen? does this equate to preventing runtime nulls?

does this mean we don't allow a function like the following to exist?

```ts
function nullableFunction(num: string) {
  if (num % 2) return;
  return num;
}
```

## limitations?

## Use Cases where a null value might be useful

1. searching in a collection
2. trees
3. linked lists
4. optional fields in structures/classes
5. searching in a data structure
6. parsing
7. recursive algorithms, esp. tree/graph traversals, when indicating that a recursion should stop / no valid path was found
8. API design to signify failure or no values
9. error handling where one doesn't want to throw an exception
