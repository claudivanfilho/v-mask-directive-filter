export const MASK_TOKEN_PATTERN = {
  D: /[0-9]/,
  X: /[a-z]|[A-Z]/,
  A: /[0-9]|[a-z]|[A-Z]/,
  '*': /.*/
};
export type MASK_TOKEN = keyof typeof MASK_TOKEN_PATTERN;

export const VMaskDirective = {
  inserted: (
    el: any,
    bindings: {
      value: string;
      modifiers: {
        unmask?: boolean;
        parseint?: boolean;
      };
    },
    vnode: any
  ) => {
    const inputElement: HTMLInputElement =
      vnode?.tag === 'input'
        ? (el as HTMLInputElement)
        : (vnode?.componentInstance?.$refs.input as HTMLInputElement);
    const mask = bindings.value;
    const shouldUnmask = bindings.modifiers.unmask;
    const parseint = bindings.modifiers.parseint;
    if (parseint) {
      if (shouldUnmask) {
        if (mask.match(/[AX*]/)) {
          throw new Error('Invalud mask to parseint modifier');
        }
      } else {
        if (mask.match(/[^D]/)) {
          throw new Error('Invalud mask to parseint modifier');
        }
      }
    }
    new InputMask(
      inputElement,
      mask,
      Boolean(shouldUnmask),
      Boolean(parseint),
      vnode?.data?.model?.callback
    );
  }
};

class InputMask {
  constructor(
    private inputElement: HTMLInputElement,
    private mask: string,
    private shouldUnmask: boolean,
    private parseint: boolean,
    private updateModel: (value: string | number) => void
  ) {
    this.refreshInput(
      maskTransform({
        unmaskedValue: inputElement.value,
        mask: mask
      }),
      null,
      0,
      true
    );
    this.initListeners();
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
        (event?.target as HTMLInputElement) || this.inputElement;
      inputElement.value = text;
      const newSelectionIndex =
        event?.type === 'click' || event?.type === 'focus'
          ? onClickInput(text, this.mask, inputElement.selectionStart || 0)
              .selectionIndex
          : selectionIndex;
      inputElement.selectionStart = newSelectionIndex;
      inputElement.selectionEnd = newSelectionIndex;
    };
    if (putIntoTimeout) {
      setTimeout(() => action(), 0);
    } else {
      action();
    }
  }

  initListeners() {
    this.inputElement.onkeydown = (event: any) => {
      const key = event.key;
      if (['ArrowRight', 'ArrowLeft', 'Tab', 'Meta'].includes(key)) {
        return;
      }
      event.preventDefault();
      const { value, selectionIndex: newSelectionIndex } = onKeyDown(
        this.parseint
          ? maskTransform({
              unmaskedValue: event.target.value,
              mask: this.mask
            })
          : event.target.value,
        this.mask,
        event?.target.selectionStart || 0,
        key
      );
      const text = value;
      this.refreshInput(text, event, newSelectionIndex, this.shouldUnmask);
      let valueToEmit: string | number = this.parseint
        ? parseInt(value)
        : value;
      if (this.shouldUnmask) {
        valueToEmit = unmaskTransform(text, this.mask, this.parseint);
      }
      if (!this.parseint || !isNaN(valueToEmit as number)) {
        this.updateModel(valueToEmit);
      } else if (this.parseint && isNaN(valueToEmit as number)) {
        this.updateModel('');
      }
    };

    this.inputElement.onblur = this.inputElement.onfocus = this.inputElement.onclick = (
      event: any
    ) => {
      this.refreshInput(
        maskTransform({
          [this.shouldUnmask ? 'unmaskedValue' : 'maskedValue']: event?.target
            ?.value,
          mask: this.mask
        }),
        event
      );
    };
  }
}

export function maskTransform(args: {
  unmaskedValue?: string | number;
  maskedValue?: string;
  mask: string;
}) {
  let text = (args.unmaskedValue as string) || '';
  if (!args.unmaskedValue && args.maskedValue) {
    text = (unmaskTransform(args.maskedValue, args.mask) as string) || '';
  }
  let maskedInput = args.mask;
  let maskCount = 0;
  let actualTokenIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextMaskKey = getNextMaskKeyFromIndex(args.mask, maskCount);
    if (nextMaskKey) {
      const { token, index: tokenIndex } = nextMaskKey;
      if (char?.match(MASK_TOKEN_PATTERN[token])) {
        actualTokenIndex = tokenIndex;
        maskedInput = replaceAt(maskedInput, char, tokenIndex);
        maskCount += 1;
      }
    } else {
      break;
    }
  }
  return trimMaskedText(maskedInput, actualTokenIndex);
}

function trimMaskedText(maskedText: string, startIndex: number) {
  let newText = maskedText;
  for (let i = startIndex; i < maskedText.length; i++) {
    const char = maskedText[i];
    if (MASK_TOKEN_PATTERN[char as MASK_TOKEN]) {
      newText = replaceAt(newText, ' ', i);
    }
  }
  return newText;
}

function getNextMaskKeyFromIndex(mask: string, maskCount: number) {
  let matchedKeys = 0;
  for (let i = 0; i < mask.length; i++) {
    if (MASK_TOKEN_PATTERN[mask[i] as MASK_TOKEN]) {
      if (matchedKeys === maskCount) {
        return {
          token: mask[i] as MASK_TOKEN,
          index: i
        };
      } else {
        matchedKeys += 1;
      }
    }
  }
}

function getNextMaskKey(value: string, mask: string) {
  for (let i = 0; i < value.length; i++) {
    if (value[i] === ' ' && MASK_TOKEN_PATTERN[mask[i] as MASK_TOKEN]) {
      return {
        token: mask[i] as MASK_TOKEN,
        index: i
      };
    }
  }
}

function getLastMaskKey(value: string, mask: string) {
  for (let i = value.length - 1; i >= 0; i--) {
    const pattern = MASK_TOKEN_PATTERN[mask[i] as MASK_TOKEN];
    if (pattern && value[i]?.match(pattern)) {
      return {
        token: mask[i] as MASK_TOKEN,
        index: i
      };
    }
  }
}

function onClickInput(value: string, mask: string, selectionIndex: number) {
  const nextMaskKey = getNextMaskKey(value, mask);
  return {
    selectionIndex: nextMaskKey?.index || selectionIndex
  };
}

function onKeyDown(
  value: string,
  mask: string,
  selectionIndex: number,
  key: string
) {
  if (key === 'Backspace') {
    return onRemoveCharFromMask(value, mask, selectionIndex);
  }
  return onAddCharToMask(value, mask, selectionIndex, key);
}

function onAddCharToMask(
  value: string,
  mask: string,
  selectionIndex: number,
  key: string
) {
  let newValue = value;
  let newSelectionIndex = selectionIndex;
  const nextMaskKey = getNextMaskKey(value, mask);
  if (nextMaskKey) {
    const { token, index } = nextMaskKey;
    const pattern = MASK_TOKEN_PATTERN[token];
    if (pattern && key?.match(pattern)) {
      newValue = replaceAt(newValue, key, index);
      newSelectionIndex = index + 1;
    }
  }
  return {
    value: newValue,
    selectionIndex: newSelectionIndex
  };
}

function onRemoveCharFromMask(
  value: string,
  mask: string,
  selectionIndex: number
) {
  let newValue = value;
  let newSelectionIndex = selectionIndex;
  const tokenAtSelectionIndex = mask[selectionIndex - 1];
  if (selectionIndex !== 0) {
    if (MASK_TOKEN_PATTERN[tokenAtSelectionIndex as MASK_TOKEN]) {
      newValue = replaceAt(newValue, ' ', selectionIndex - 1);
      newSelectionIndex = selectionIndex - 1;
    } else {
      const nextMaskKey = getLastMaskKey(value, mask);
      if (nextMaskKey) {
        newValue = replaceAt(newValue, ' ', nextMaskKey.index);
        newSelectionIndex = nextMaskKey.index;
      }
    }
  }
  return {
    value: newValue,
    selectionIndex: newSelectionIndex
  };
}

function replaceAt(origString: string, replaceChar: string, index: number) {
  const firstPart = origString.substr(0, index);
  const lastPart = origString.substr(index + 1);
  const newString = firstPart + replaceChar + lastPart;
  return newString;
}

export function unmaskTransform(
  text: string,
  mask: string,
  parseToInt = false
) {
  let newText = '';
  for (let i = 0; i < mask.length; i++) {
    const pattern = MASK_TOKEN_PATTERN[mask[i] as MASK_TOKEN];
    if (pattern) {
      if (text[i]?.match(pattern)) {
        newText += text[i];
      }
    }
  }
  return parseToInt ? parseInt(newText) : newText;
}
