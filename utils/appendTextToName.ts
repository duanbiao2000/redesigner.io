export const appendTextToName = (
	name: string,
	type: string,
	theme: string,
): string => {
	const predicted = `-${theme.toLowerCase().replace(' ', '-')}-${type
		.toLowerCase()
		.replace(' ', '-')}`
	const dot = '.'
	const splitName = name.split(dot)
	const splitNameLength = splitName.length
	// 根据splitName的组成部分构建一个预测的名称
	// 1. 切割splitName，获取除最后一个部分外的所有部分
	// 2. 将predicted插入到切割后的部分中
	// 3. 添加一个点(".")以符合名称的格式
	// 4. 最后添加splitName的最后一个部分
	// 这个过程用于根据给定的splitName和预测部分生成一个新的预测名称
	const predictedName = splitName
		.slice(0, splitNameLength - 1)
		.concat(predicted)
		.concat(dot)
		.concat(splitName[splitNameLength - 1])
		.join('')
	return predictedName
}
