# V-MASK-DIRECTIVE-FILTER
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fclaudivanfilho%2Fv-mask-directive-filter.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fclaudivanfilho%2Fv-mask-directive-filter?ref=badge_shield)


A input mask directive and filter compatible with **vue 2.x** and **vuetify 2.x**

## Bundle Size (incredibly lighter :star2:)

| Size   | Gziped |
| ------ | ------ |
| 3.8 kb | 1.5kb  |

## Instalation

```shell
$ yarn add v-mask-directive-filter

or

$ npm install --save v-mask-directive-filter
```

### Directive

```javascript
// Import the directive inside your main.(js|ts)

import { VMaskDirective } from 'v-mask-directive-filter';

Vue.directive('mask', VMaskDirective);
```

### Filter

```javascript
// Import the filter inside your main.(js|ts)

import { VFilterDirective } from 'v-mask-directive-filter';

Vue.filter('mask', VFilterDirective);
```

## Config

### Tokens

| Token | Pattern                 | Description       |
| ----- | ----------------------- | ----------------- |
| N     | [0-9]                   | numbers only      |
| S     | [a-z] \| [A-Z]          | string a-z only   |
| A     | [0-9] \| [a-z] \| [A-Z] | alphanumeric only |
| X     | .\*                     | any char          |

### Modifiers

| Modifier | Default | Description                                |
| -------- | ------- | ------------------------------------------ |
| unmask   | false   | unmask the return value to the model       |
| parseint | false   | parse to int the return value to the model |

## Usage

### Using native input element

```html
// Inside your .vue component

<template>
  <input v-model="cpf" v-mask="'NNN.NNN.NNN-NN'" />
</template>

// Entry => 99999999999 | cpf => "999.999.999-99"
```

### Using v-text-field of Vuetify

```html
// Inside your .vue component

<template>
  <v-text-field v-mask.unmask="'(NN) NNNNN - NNNN'" v-model="phoneNumber" />
</template>

// Entry => 83999998888 | phoneNumber => "83999998888"

<template>
  <v-text-field v-mask="'(NN) NNNNN - NNNN'" v-model="phoneNumber" />
</template>

// Entry => 83999998888 | phoneNumber => "(83) 99999 - 8888"
```

### Using vue 2.x filter

```html
// Inside your .vue component
<span> {{ '83999998888' | mask('(NN) NNNNN - NNNN') }} </span>

// This will result => (83) 99999 - 8888
```

### Using helper functions

```javascript

<script>
  import { maskTransform, unmaskTransform } from 'v-mask-directive-filter'
  export default Vue.extends({
    computed: {
      phoneFormatted(val) {
        return maskTransform(val, '(NN) NNNNN - NNNN')
      }
    }
  })
</script>

```

## Demo

**vue 2.x + vuetify 2.x sample**
https://codesandbox.io/s/flamboyant-kilby-xv8hz


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fclaudivanfilho%2Fv-mask-directive-filter.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fclaudivanfilho%2Fv-mask-directive-filter?ref=badge_large)