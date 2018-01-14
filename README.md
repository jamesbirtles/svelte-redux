# Svelte Redux

Connect svelte components to a redux store.

## Install

```sh
npm i svelte-redux
```

## Usage

### Connect the store

Assuming you already have a store set up, you need to connect it to your svelte component.
You do this like so:

```js
export default {
    store: connect(store, mapStateToData, mapDispatchToStore),

    // ...
};
```

If you've used redux with react, this should be quite familiar.

### Map the state

The `mapStateToData` property is a function that, given the current state, returns the data you want to consume in this component.

In this very simplistic example, our whole state is just a number (we're building a simple counter) so you might map it as below:

```js
const mapStateToData = state => {
    return {
        count: state,
    };
};
```

### Using the data

Now that we've mapped our state to `count`, we can access it in the template like you would with local state, however it is prepended with a `$`.

```html
<h1>
    Clicked {{$count}} times
</h1>
```

### Dispatching actions

In order to dispatch actions, you must first map a dispatch function to the store.

```js
const mapDispatchToStore = dispatch => {
    return {
        increment: () => dispatch({ type: 'INCREMENT' }),
        decrement: () => dispatch({ type: 'DECREMENT' }),
    };
};
```

And now we can access these functions in the template via the store

```html
<button on:click="store.increment()">+</button>
<button on:click="store.decrement()">-</button>
```

### Optimisations

At this point everything should be working, there are however a few things we can change for convenience.

The `mapDispatchToStore` function is quite verbose given the simple goal so we can instead use the shorthand:

```js
const mapDispatchToStore = {
    increment: () => ({ type: 'INCREMENT' }),
    decrement: () => ({ type: 'DECREMENT' }),
};
```

Passing store to connect every time is slightly inconvenient and requires all your components to know about `store`.
We can use the `bindConnect` to make this slightly nicer.

```js
const connect = bindConnect(store);

// ...

export default {
    store: connect(mapStateToData, mapDispatchToStore),
};
```

And now we can use this connect function instead of the one imported from svelte-redux

## Full Example

###### `store.js`

```js
import { createStore } from 'redux';
import { bindConnect } from 'svelte-redux';

const store = createStore((state = 0, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'DECREMENT':
            return state - 1;
        default:
            return state;
    }
});

export const connect = bindConnect(store);
```

###### `Counter.html`

```html
<h1>
	Clicked {{$count}} times
</h1>
<button on:click="store.increment()">+</button>
<button on:click="store.decrement()">-</button>

<script>
    import { connect } from './store';

    const mapStateToData = state => {
		return {
			count: state,
		};
	};

    const mapDispatchToStore = {
		increment: () => ({ type: 'INCREMENT' }),
		decrement: () => ({ type: 'DECREMENT' }),
	}

    export default {
        store: connect(mapStateToData, mapDispatchToStore)
    }
</script>
```
