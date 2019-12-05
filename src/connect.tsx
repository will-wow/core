import React, { useState, useEffect, useContext } from 'react'
import { Observable, Subscription } from 'rxjs'
import { withViewModel, ViewModel, ActionMap, Difference } from '@rxreact/core'

type NonSignalGraphProps<Props, Selectors, Actions, OwnProps> = Difference<
  Props,
  Selectors & ActionMap<Actions>
> &
  OwnProps

export type ConnectViewModel<Selectors, Actions> = ViewModel<
  Selectors,
  Actions
> & { unsubscribe?: Subscription[] }

export function connect<SignalGraph, Selectors, Actions, OwnProps>(
  context: React.Context<SignalGraph>,
  viewModelFactory: (
    signalGraph: SignalGraph,
    ownProps: Observable<OwnProps>,
  ) => ConnectViewModel<Selectors, Actions>,
) {
  return function connectWithComponent<
    Props extends Selectors & ActionMap<Actions> & OwnProps
  >(Component: React.ComponentType<Props>) {
    // The final component takes all the props of `component`,
    // _except_ the ones passed in from the Signal Graph.
    const Connected: React.FunctionComponent<
      NonSignalGraphProps<Props, Selectors, Actions, OwnProps>
    > = props => {
      // The Child component to render
      const [{ Child }, setChild] = useState<{
        Child: React.ComponentClass<
          NonSignalGraphProps<Props, Selectors, Actions, OwnProps>
        > | null
      }>({ Child: null })

      const [localSubscriptions, setLocalSubscriptions] = useState<
        Subscription[] | null
      >(null)

      const signalGraph = useContext(context)

      // Wrap the child with `withViewModel`, but only do this once.
      useEffect(() => {
        const child = withViewModel((ownProps: Observable<OwnProps>) => {
          const { inputs, outputs, unsubscribe } = viewModelFactory(
            signalGraph,
            ownProps,
          )

          // Store the unsubscribes for cleanup.
          setLocalSubscriptions(unsubscribe || null)

          return { inputs, outputs }
        })(Component)
        // Wrap the child in an object, because `setChild` when passed a
        // function (like a component) will actually call the function.
        setChild({ Child: child })
      }, [signalGraph])

      // On destroy, perform cleanup
      useEffect(() => {
        return () => {
          if (localSubscriptions) {
            localSubscriptions.map(subscription => subscription.unsubscribe())
          }
        }
      }, [localSubscriptions])

      return Child ? <Child {...props} /> : null
    }

    return Connected
  }
}
