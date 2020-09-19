import { DirectiveOptions } from 'vue'

export const MASK_TOKEN_PATTERN = {
  N: /[0-9]/,
  S: /[a-z]|[A-Z]/,
  A: /[0-9]|[a-z]|[A-Z]/,
  X: /.*/,
}
export type MASK_TOKEN = keyof typeof MASK_TOKEN_PATTERN

export const VMaskFilter = (value: string, mask: string) => {
  return maskTransform(value + '', mask)
}

export const VMaskDirective: DirectiveOptions = {
  inserted: (
    el: any,
    bindings: {
      value?: string
      modifiers: {
        unmask?: boolean
        parseint?: boolean
      }
    },
    vnode: any
  ) => {
    const mask = bindings.value
    const shouldUnmask = bindings.modifiers.unmask
    const parseint = bindings.modifiers.parseint
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
    if (parseint) {
      if (shouldUnmask) {
        if (mask.match(/[AXS*]/)) {
          throw new Error('Invalud mask to parseint modifier')
        }
      } else {
        if (mask.match(/[^N]/)) {
          throw new Error('Invalud mask to parseint modifier')
        }
      }
    }
    new InputMask(
      isNativeInput,
      inputElement,
      mask,
      Boolean(shouldUnmask),
      Boolean(parseint),
      isNativeInput
        ? (input: HTMLInputElement) => {
            const event = new Event('input', { bubbles: true })
            input.dispatchEvent(event)
          }
        : vnode?.data?.model?.callback
    )
  },
}

class InputMask {
  constructor(
    private isNativeInput: boolean,
    private inputElement: HTMLInputElement,
    private mask: string,
    private shouldUnmask: boolean,
    private parseint: boolean,
    private updateModel: (value: string | number | HTMLInputElement) => void
  ) {
    this.refreshInput(maskTransform(inputElement.value, mask), null, 0, true)
    this.initListeners()
  }

  /**
   * Updates the input element with the text masked
   *
   * @param text text masked
   * @param event (optional) click, blur or focus event
   * @param putIntoTimeout (default is false) Necessary to vuetify use with unmask active
   */
  refreshInput(
    text: string,
    event?: MouseEvent | FocusEvent | KeyboardEvent | null,
    selectionIndex = 0,
    putIntoTimeout = false
  ) {
    const action = () => {
      const inputElement: HTMLInputElement =
        (event?.target as HTMLInputElement) || this.inputElement
      inputElement.value = text
      const newSelectionIndex =
        event?.type === 'click' || event?.type === 'focus'
          ? onClickInput(text, this.mask, inputElement.selectionStart || 0)
              .selectionIndex
          : selectionIndex
      inputElement.selectionStart = newSelectionIndex
      inputElement.selectionEnd = newSelectionIndex
    }
    if (putIntoTimeout) {
      setTimeout(() => action(), 0)
    } else {
      action()
    }
  }

  initListeners() {
    this.inputElement.onkeydown = (event: any) => {
      const key = event.key
      if (['ArrowRight', 'ArrowLeft', 'Tab', 'Meta'].includes(key)) {
        return
      }
      event.preventDefault()
      const { value, selectionIndex: newSelectionIndex } = onKeyDown(
        this.parseint
          ? maskTransform(event.target.value, this.mask)
          : event.target.value,
        this.mask,
        event?.target.selectionStart || 0,
        key
      )
      const text = value
      this.refreshInput(text, event, newSelectionIndex, this.shouldUnmask)
      let valueToEmit: string | number = this.parseint ? parseInt(value) : value
      if (this.shouldUnmask) {
        valueToEmit = unmaskTransform(text, this.mask, this.parseint)
      }
      if (!this.parseint || !isNaN(valueToEmit as number)) {
        this.updateModel(this.isNativeInput ? this.inputElement : valueToEmit)
      } else if (this.parseint && isNaN(valueToEmit as number)) {
        this.updateModel('')
      }
    }

    this.inputElement.onblur = this.inputElement.onfocus = this.inputElement.onclick = (
      event: any
    ) => {
      this.refreshInput(
        maskTransform(
          this.shouldUnmask
            ? event?.target?.value
            : unmaskTransform(event?.target?.value, this.mask),
          this.mask
        ),
        event
      )
    }
  }
}

export function maskTransform(value: string | number, mask: string) {
  let text = (value || '') + ''
  let maskedInput = trimMaskedText(mask, 0)
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextMaskKey = getNextMaskKey(maskedInput, mask)
    if (nextMaskKey) {
      const { token, index: tokenIndex } = nextMaskKey
      if (char?.match(MASK_TOKEN_PATTERN[token])) {
        maskedInput = replaceAt(maskedInput, char, tokenIndex)
      }
    } else {
      break
    }
  }
  return maskedInput
}

function trimMaskedText(maskedText: string, startIndex: number) {
  let newText = maskedText
  for (let i = startIndex; i < maskedText.length; i++) {
    const char = maskedText[i]
    if (MASK_TOKEN_PATTERN[char as MASK_TOKEN]) {
      newText = replaceAt(newText, ' ', i)
    }
  }
  return newText
}

function getNextMaskKey(value: string, mask: string) {
  for (let i = 0; i < value.length; i++) {
    if (value[i] === ' ' && MASK_TOKEN_PATTERN[mask[i] as MASK_TOKEN]) {
      return {
        token: mask[i] as MASK_TOKEN,
        index: i,
      }
    }
  }
}

function getLastMaskKey(value: string, mask: string) {
  for (let i = value.length - 1; i >= 0; i--) {
    const pattern = MASK_TOKEN_PATTERN[mask[i] as MASK_TOKEN]
    if (pattern && value[i]?.match(pattern)) {
      return {
        token: mask[i] as MASK_TOKEN,
        index: i,
      }
    }
  }
}

function onClickInput(value: string, mask: string, selectionIndex: number) {
  const nextMaskKey = getNextMaskKey(value, mask)
  return {
    selectionIndex: nextMaskKey?.index || selectionIndex,
  }
}

function onKeyDown(
  value: string,
  mask: string,
  selectionIndex: number,
  key: string
) {
  if (key === 'Backspace') {
    return onRemoveCharFromMask(value, mask, selectionIndex)
  }
  return onAddCharToMask(value, mask, selectionIndex, key)
}

function onAddCharToMask(
  value: string,
  mask: string,
  selectionIndex: number,
  key: string
) {
  let newValue = value
  let newSelectionIndex = selectionIndex
  const nextMaskKey = getNextMaskKey(value, mask)
  if (nextMaskKey) {
    const { token, index } = nextMaskKey
    const pattern = MASK_TOKEN_PATTERN[token]
    if (pattern && key?.match(pattern)) {
      newValue = replaceAt(newValue, key, index)
      newSelectionIndex = index + 1
    }
  }
  return {
    value: newValue,
    selectionIndex: newSelectionIndex,
  }
}

function onRemoveCharFromMask(
  value: string,
  mask: string,
  selectionIndex: number
) {
  let newValue = value
  let newSelectionIndex = selectionIndex
  if (selectionIndex !== 0) {
    const tokenAtSelectionIndex = mask[selectionIndex - 1]
    if (MASK_TOKEN_PATTERN[tokenAtSelectionIndex as MASK_TOKEN]) {
      newValue = replaceAt(newValue, ' ', selectionIndex - 1)
      newSelectionIndex = selectionIndex - 1
    } else {
      const nextMaskKey = getLastMaskKey(value, mask)
      if (nextMaskKey) {
        newValue = replaceAt(newValue, ' ', nextMaskKey.index)
        newSelectionIndex = nextMaskKey.index
      }
    }
  }
  return {
    value: newValue,
    selectionIndex: newSelectionIndex,
  }
}

function replaceAt(origString: string, replaceChar: string, index: number) {
  return (
    origString.substr(0, index) + replaceChar + origString.substr(index + 1)
  )
}

export function unmaskTransform(
  text: string,
  mask: string,
  parseToInt = false
) {
  let newText = ''
  for (let i = 0; i < mask.length; i++) {
    const pattern = MASK_TOKEN_PATTERN[mask[i] as MASK_TOKEN]
    if (pattern) {
      if (text[i]?.match(pattern)) {
        newText += text[i]
      }
    }
  }
  return parseToInt ? parseInt(newText) : newText
}
