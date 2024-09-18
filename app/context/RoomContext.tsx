'use client'

import React, { ReactNode, createContext, useMemo } from 'react'
import {
	RoomThemeType,
	RoomThemeTypes,
	RoomType,
	RoomTypes,
} from '@redesigner/utils/roomTypes'

type ContextProps = {
	roomType: RoomType | null
	setRoomType: (roomType: RoomType | null) => void
	roomTheme: RoomThemeType | null
	setRoomTheme: (roomTheme: RoomThemeType | null) => void
}

/**
 * 创建一个房间上下文对象，用于在应用中传递和管理房间的类型和主题
 * 该上下文对象包含当前房间的类型、更改房间类型的方法、房间的主题以及更改房间主题的方法
 */
export const RoomContext = createContext<ContextProps>({
	// 默认房间类型为RoomTypes数组的第一个元素
	roomType: RoomTypes[0],
	// 设置房间类型的方法，此处为空实现，需在消费该上下文的组件中根据具体逻辑实现
	setRoomType: roomType => {},
	// 默认房间主题为RoomThemeTypes数组的第一个元素
	roomTheme: RoomThemeTypes[0],
	// 设置房间主题的方法，此处为空实现，需在消费该上下文的组件中根据具体逻辑实现
	setRoomTheme: roomTheme => {},
});

/**
 * RoomProvider 组件是一个 React 函数组件，用于提供房间类型和主题的上下文。
 * 它接收一个 children 属性，该属性是一个 ReactNode，用于包含需要访问上下文的子组件。
 * 该组件通过 React 的状态钩子 (useState) 维护房间类型和主题的状态，并提供更改这些状态的函数。
 * 
 * @param {ReactNode} children - 要渲染的子组件，这些组件可以访问房间类型和主题的上下文。
 * @returns {ReactNode} 返回要渲染的子组件，这些组件将被 RoomProvider 组件包裹，以便提供上下文值。
 */
export const RoomProvider = ({ children }: { children: ReactNode }) => {
  // 初始化房间类型状态，默认为 RoomTypes 数组的第一个元素。
  const [roomType, setRoomType] = React.useState<ContextProps['roomType']>(
    RoomTypes[0],
  );
  // 初始化房间主题状态，默认为 RoomThemeTypes 数组的第一个元素。
  const [roomTheme, setRoomTheme] = React.useState<ContextProps['roomTheme']>(
    RoomThemeTypes[0],
  );


// 使用useMemo钩子来优化组件的性能。当组件重新渲染时，
// 只有当依赖项roomType、setRoomType、roomTheme、setRoomTheme的值发生变化时，
// 这个useMemo才会重新计算。否则将返回之前计算的结果，从而避免了不必要的计算，
// 减少了组件的渲染时间，提升了性能。
const value = useMemo(
	() => ({
		roomType,
		setRoomType,
		roomTheme,
		setRoomTheme,
	}),
	[roomType, setRoomType, roomTheme, setRoomTheme],
)

// 返回封装了值的RoomContext.Provider组件
// 该组件用于向下的组件树中提供房间相关的数据和功能
// 参数:
// - value: 要传递给RoomContext.Consumer或useContext钩子的值
// - children: 被封装的RoomContext.Provider组件的子组件
// 返回值:
// - 返回一个RoomContext.Provider元素，其中包含提供的值和子组件
return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}
