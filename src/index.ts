import { DirectiveOptions } from 'vue'

export type IMASK_TOKEN_PATTERN = {
  [key: string]: RegExp
}

export const MASK_TOKEN_PATTERN: IMASK_TOKEN_PATTERN = {
  N: /[0-9]/,
  S: /[a-z]|[A-Z]/,
  A: /[0-9]|[a-z]|[A-Z]/,
  C: /[^ ]/,
  X: /.*/,
}
export type MASK_TOKEN = keyof typeof MASK_TOKEN_PATTERN

export function getCustomMaskDirective(
  mapTokens = MASK_TOKEN_PATTERN
): DirectiveOptions {
  return {
    inserted: (el: any, bindings: any, vnode: any) => {
      const mask = bindings.value
      const shouldUnmask = bindings.modifiers.unmask
      const parseint = bindings.modifiers.parseint
      const initChange = bindings.modifiers['init-change']
      const hideOnEmpty = bindings.modifiers['hide-on-empty']
      const nInput = el.getElementsByTagName('input')
      const isNativeInput = vnode?.tag === 'input'
      if (!isNativeInput && nInput.length === 0) {
        throw new Error('Mask element must contains an input element inside')
      }
      const inputElement: HTMLInputElement = isNativeInput ? el : nInput[0]
      if (!mask) {
        throw new Error('Mask not provided')
      }
      if (isNativeInput && shouldUnmask) {
        throw new Error(
          `It's not possible unmask a native input element, you must use uthe method unmaskTransform dynamically inside your component logic`
        )
      }
      if (isNativeInput && parseint) {
        throw new Error(
          `It's not possible parseint a native input element, you must use uthe method parseInt dynamically inside your component logic`
        )
      }

      new InputMaskDOMManiputalion(
        mapTokens,
        inputElement,
        isNativeInput,
        mask,
        Boolean(shouldUnmask),
        Boolean(parseint),
        hideOnEmpty,
        initChange,
        isNativeInput
          ? (input: any, returnValue?: boolean) => {
              if (returnValue) {
                return input.value
              } else {
                const event = new Event('input', { bubbles: true })
                input.dispatchEvent(event)
              }
            }
          : (val: any, returnValue?: boolean) => {
              return returnValue
                ? vnode?.data?.model?.value
                : vnode?.data?.model?.callback(val)
            }
      )
    },
  }
}

export const VMaskFilter = (
  value: string,
  mask: string,
  mapTokens: IMASK_TOKEN_PATTERN = MASK_TOKEN_PATTERN
) => {
  return maskTransform(value + '', mask, mapTokens)
}

export const VMaskDirective: DirectiveOptions = getCustomMaskDirective()

class InputMaskDOMManiputalion {
  private maskService: MaskLogic
  private lastValue = ''
  constructor(
    private mapTokens = MASK_TOKEN_PATTERN,
    private inputElement: HTMLInputElement,
    private isNativeInput: boolean,
    private mask: string,
    private shouldUnmask: boolean,
    private parseint: boolean,
    private hideOnEmpty: boolean,
    initChange: boolean,
    private modelHandler: (
      value: string | number | HTMLInputElement,
      returnValue?: boolean
    ) => any
  ) {
    this.maskService = new MaskLogic(mask, mapTokens, parseint)
    const masked = this.maskService.maskTransform(modelHandler('', true))
    this.refreshInput(masked)
    if (initChange) {
      this.formatAndEmit(masked)
    }
    this.initListeners()
  }

  refreshInput(text: string) {
    const index = this.maskService.getNextMaskIndex(text)
    const hasModifications =
      text !== this.maskService.trimMaskedText(this.mask, 0)
    const mustUpdate = !this.hideOnEmpty || hasModifications
    const action = () => {
      this.inputElement.value = mustUpdate ? text : ''
      this.inputElement.selectionStart = index
      this.inputElement.selectionEnd = index
      this.lastValue = this.inputElement.value
    }
    if (this.isMobile() || this.shouldUnmask) {
      setTimeout(() => action(), 0)
    } else {
      action()
    }
  }

  remask(text: string, fromUnmasked = true) {
    return this.maskService.maskTransform(
      this.maskService.unmaskTransform(text, fromUnmasked, false)
    )
  }

  popValue(text: string) {
    const unmasked = this.maskService.unmaskTransform(text, false) as string
    return this.maskService.maskTransform(unmasked.slice(0, -1))
  }

  isMobile = () =>
    /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i.test(
      navigator.userAgent
    )

  onInput = (event: any) => {
    const target: HTMLInputElement | null = event.target as HTMLInputElement
    const value = target.value
    const start = target.selectionStart || 0
    const isComposition = event.inputType === 'insertCompositionText'
    let finalValue = this.remask(
      value,
      event.inputType === 'insertFromPaste' || this.hideOnEmpty
    )
    if (event.inputType === 'deleteContentBackward') {
      if (finalValue === this.lastValue) {
        finalValue = this.popValue(finalValue)
      }
    }
    const pattern = this.mapTokens[this.mask[start - 1]]
    if (
      finalValue !== value &&
      isComposition &&
      pattern &&
      !value[start - 1].match(pattern)
    ) {
      this.refreshInput(finalValue)
    } else if (!(isComposition && !this.isMobile())) {
      this.refreshInput(finalValue)
    }
    this.formatAndEmit(finalValue)
  }

  onClick = (event: any) => this.refreshInput(event.target.value)

  initListeners() {
    this.inputElement.oninput = this.onInput
    this.inputElement.onclick = this.onClick
    this.inputElement.onkeyup = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        this.onClick(e)
      }
    }
  }

  formatAndEmit(text: string) {
    let valueToEmit: string | number = text
    if (
      this.hideOnEmpty &&
      text === this.maskService.trimMaskedText(this.mask, 0)
    ) {
      valueToEmit = ''
    } else if (this.shouldUnmask) {
      valueToEmit = this.maskService.unmaskTransform(text)
    }
    if (!this.parseint || !isNaN(valueToEmit as number)) {
      this.modelHandler(this.isNativeInput ? this.inputElement : valueToEmit)
    } else if (this.parseint && isNaN(valueToEmit as number)) {
      this.modelHandler('')
    }
  }
}

class MaskLogic {
  constructor(
    private mask: string,
    private mapTokens = MASK_TOKEN_PATTERN,
    private parseToInt = false
  ) {}

  maskTransform(value: string | number) {
    const text = (value || '') + ''
    let maskedInput = this.trimMaskedText(this.mask, 0)
    let lastIndex = 0
    for (let i = 0; i < this.mask.length; i++) {
      const pattern = this.mapTokens[this.mask[i]]
      if (pattern) {
        for (let j = lastIndex; j < text.length; j++) {
          if (text[j].match(pattern)) {
            maskedInput = this.replaceAtRange(maskedInput, text[j], i)
            lastIndex = j + 1
            break
          }
        }
      }
    }
    return maskedInput
  }

  trimMaskedText(maskedText: string, startIndex: number) {
    let newText = maskedText
    for (let i = startIndex; i < maskedText.length; i++) {
      const char = maskedText[i]
      if (this.mapTokens[char]) {
        newText = this.replaceAtRange(newText, ' ', i)
      }
    }
    return newText
  }

  getNextMaskIndex(value: string) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] === ' ' && this.mapTokens[this.mask[i]]) {
        return i
      }
    }
    return value.length
  }

  replaceAtRange(
    origString: string,
    replaceChar: string,
    indexStart: number,
    indexEnd = -1
  ) {
    return (
      origString.substr(0, indexStart) +
      replaceChar +
      origString.substr(indexEnd === -1 ? indexStart + 1 : indexEnd)
    )
  }

  unmaskTransform(text: string, fromUnmasked = false, useParseInt = true) {
    let newText = ''
    let lastValueIndex = 0
    for (let i = 0; i < this.mask.length; i++) {
      const pattern = this.mapTokens[this.mask[i]]
      if (pattern) {
        if (fromUnmasked) {
          for (let j = lastValueIndex; j < text.length; j++) {
            if (text[j]?.match(pattern)) {
              newText += text[j]
              lastValueIndex = j + 1
            }
          }
        } else {
          if (text[i]?.match(pattern)) {
            newText += text[i]
          }
        }
      }
    }
    if (useParseInt) {
      return this.parseToInt ? parseInt(newText) : newText
    }
    return newText
  }
}

export function unmaskTransform(
  value: string,
  mask: string,
  mapTokens = MASK_TOKEN_PATTERN,
  fromUnmasked = false,
  parseToInt = false
) {
  return new MaskLogic(mask, mapTokens, parseToInt).unmaskTransform(
    value,
    fromUnmasked
  )
}

export function maskTransform(
  value: string,
  mask: string,
  mapTokens = MASK_TOKEN_PATTERN
) {
  return new MaskLogic(mask, mapTokens, false).maskTransform(value)
}
