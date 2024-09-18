import React, { Component, ErrorInfo, ReactNode } from 'react'

// 定义组件的属性接口
interface Props {
	children?: ReactNode
}

// 定义组件的状态接口
interface State {
	hasError: boolean
}

// ErrorBoundary组件用于捕获其子组件树中的所有错误，并显示回退UI
class ErrorBoundary extends Component<Props, State> {
	// 初始化状态
	public state: State = {
		hasError: false,
	}
	constructor(props: Props) {
		super(props)
		
		// 定义一个状态变量来跟踪是否发生错误
		this.state = { hasError: false }
	}
	// 当静态方法getDerivedStateFromError被调用时，更新状态以显示回退UI
	static getDerivedStateFromError(error: Error): State {
		// 更新状态，所以下次渲染时会显示回退UI
		return { hasError: true }
	}
	// 错误捕获后调用该方法，可以在这里使用自己的错误日志服务
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// 你可以在这里使用自己的错误日志服务
		console.log({ error, errorInfo })
	}
	// 渲染组件
	render() {
		// 检查是否有错误抛出
		if (this.state.hasError) {
			// 你可以渲染任何自定义的回退UI
			return (
				<div className="flex w-100 min-h-screen align-center justify-center flex-col text-center">
					<h2>Oops, there is an error!</h2>
					<button
						type="button"
						// 点击按钮重置状态，尝试重新渲染子组件
						onClick={() => this.setState({ hasError: false })}
					>
						Try again?
					</button>
				</div>
			)
		}

		// 如果没有错误，则正常渲染子组件
		return this.props.children
	}
}

export default ErrorBoundary
