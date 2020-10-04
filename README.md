# V-MASK-DIRECTIVE-FILTER
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fclaudivanfilho%2Fv-mask-directive-filter.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fclaudivanfilho%2Fv-mask-directive-filter?ref=badge_shield)


> ## Support to **Vue 3** available [here](https://github.com/claudivanfilho/v-slim-mask)

A incredibly **LIGHTER** input mask directive and filter compatible with **Vue 2** and **Vuetify 2**

<!-- ![github start](https://badgen.net/github/stars/claudivanfilho/v-mask-directive-filter) -->

![npm version](https://badgen.net/npm/v/v-mask-directive-filter)
![Min](https://badgen.net/bundlephobia/min/v-mask-directive-filter)
![Min Gziped](https://badgen.net/bundlephobia/minzip/v-mask-directive-filter)

![Travis Build](https://travis-ci.org/claudivanfilho/v-mask-directive-filter.svg?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/claudivanfilho/v-mask-directive-filter/badge.svg?targetFile=package.json)](https://snyk.io/test/github/claudivanfilho/v-mask-directive-filter?targetFile=package.json)

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome Android | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE9>, Edge                                                                                                                                                                                                      | 6>                                                                                                                                                                                                                | 1>                                                                                                                                                                                                            | 18>                                                                                                                                                                                                                   | 3.1>                                                                                                                                                                                                          | 2>                                                                                                                                                                                                                            | 12>                                                                                                                                                                                                       |

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

or

```javascript
// using a custom directive

import { getCustomMaskDirective } from 'v-slim-mask'

const VMASKCustomDirective = getCustomMaskDirective({
  '#': /[0-9]/,
  Z: /[a-z]|[A-Z]/,
})
Vue.directive('mask', VMASKCustomDirective)
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
| C     | [^ ]                    | required char     |
| X     | .\*                     | optional char     |

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


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fclaudivanfilho%2Fv-mask-directive-filter.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fclaudivanfilho%2Fv-mask-directive-filter?ref=badge_large)