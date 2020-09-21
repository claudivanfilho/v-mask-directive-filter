# V-MASK-DIRECTIVE-FILTER

A incredibly lighter input mask directive and filter compatible with **vue 2.x** and **vuetify 2.x**

<!-- ![github start](https://badgen.net/github/stars/claudivanfilho/v-mask-directive-filter) -->

![npm version](https://badgen.net/npm/v/v-mask-directive-filter)
![Min](https://badgen.net/bundlephobia/min/v-mask-directive-filter)
![Min Gziped](https://badgen.net/bundlephobia/minzip/v-mask-directive-filter)

![Travis Build](https://travis-ci.org/claudivanfilho/v-mask-directive-filter.svg?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/claudivanfilho/v-mask-directive-filter/badge.svg?targetFile=package.json)](https://snyk.io/test/github/claudivanfilho/v-mask-directive-filter?targetFile=package.json)

## Instalation

```shell
$ yarn add v-mask-directive-filter

or

$ npm install --save v-mask-directive-filter
```

### Directive

```javascript
// Import the directive inside your main.(js|ts)

import { VMaskDirective } from 'v-mask-directive-filter'

Vue.directive('mask', VMaskDirective)
```

### Filter

```javascript
// Import the filter inside your main.(js|ts)

import { VFilterDirective } from 'v-mask-directive-filter'

Vue.filter('mask', VFilterDirective)
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

| Modifier      | Default | Description                                |
| ------------- | ------- | ------------------------------------------ |
| unmask        | false   | unmask the return value to the model       |
| parseint      | false   | parse to int the return value to the model |
| init-change   | false   | set a initial value to the model on start  |
| hide-on-empty | false   | hide the mask if no value                  |

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
