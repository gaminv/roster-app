import { Component, type ReactNode } from 'react'
import { MESSAGES } from '../constants/messages'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>{MESSAGES.ERROR_BOUNDARY_TITLE}</h1>
          <p>{this.state.error?.message ?? MESSAGES.ERROR_BOUNDARY_UNKNOWN}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
          >
            {MESSAGES.ERROR_BOUNDARY_RETRY}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
