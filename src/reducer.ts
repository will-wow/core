import { Observable } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import { err, ok, Result } from '~/lib/result'

export const watchSignal = <T>(o: Observable<T>) => {
  const hot = o.pipe(shareReplay(1))
  // TODO not this
  hot.subscribe()
  return hot
}

const toEmit: jest.CustomMatcher = async function toEmit<T>(
  this: jest.MatcherUtils,
  o: Observable<T>,
  expected?: T
) {
  const result: Result<T> = await new Promise(resolve => {
    const timeout = setTimeout(() => resolve(err(new Error('timeout'))), 100)

    o.subscribe((value: T) => {
      clearTimeout(timeout)
      resolve(ok(value))
    })
  })

  let actual: T | undefined
  let pass = false
  let message: () => string

  if (expected === undefined) {
    pass = result.isOk()
    message = () =>
      `${this.utils.matcherHint('toEmit')}\n\n` +
      `Expected signal to emit\n` +
      `Signal did not emit`
  } else if (result.isOk()) {
    actual = result.unwrap()
    pass = this.equals(result.unwrap(), expected)
    message = () =>
      `${this.utils.matcherHint('toEmit')}\n\n` +
      `Expected: ${this.utils.printExpected(expected)}\n` +
      `Received: ${this.utils.printReceived(actual)}`
  } else {
    message = () =>
      `${this.utils.matcherHint('toEmit')}\n\n` +
      `Expected: ${this.utils.printExpected(expected)}\n` +
      `Signal did not emit`
  }

  return { actual, pass, message }
}

expect.extend({ toEmit })

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
  namespace jest {
    interface Matchers<R> {
      toEmit<T>(expectedValue?: T): Promise<R>
    }
  }
}
