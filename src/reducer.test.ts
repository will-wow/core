import _ from 'lodash'
import { of } from 'rxjs'

import { reducer, reduceUniqueAppend, reduceUniqueIndex } from './reducer'

describe('reducer', () => {
  it('handles reducing some observables', async () => {
    const o1 = of(1)
    const o2 = of(2)

    const o3 = reducer([[o1, _.add], [o2, _.subtract]], 0)
    const n3 = await o3.toPromise()

    expect(n3).toBe(-1)
  })
})

describe('reduceUniqueIndex', () => {
  const acc = [{ id: 1 }, { id: 2 }, { id: 3 }]

  it('removes duplicates and add new values', () => {
    const value = [{ id: 2 }, { id: 4 }]
    expect(reduceUniqueIndex(acc, value)).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])
  })
})

describe('reduceUniqueAppend', () => {
  const acc = [{ id: 1 }, { id: 2 }, { id: 3 }]

  it('removes duplicates', () => {
    const value = { id: 2 }
    expect(reduceUniqueAppend(acc, value)).toEqual(acc)
  })

  it('appends new values', () => {
    const value = { id: 4 }
    expect(reduceUniqueAppend(acc, value)).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])
  })
})
