/**
 * 下载图片
 * @param url 图片的URL
 * @param name 下载的文件名
 */
const downloadImg = async (url: string, name: string) => {
	// 从URL获取blob数据
	await fetch(url, {
		headers: new Headers({
			Origin: window.location.origin,
		}),
		mode: 'cors',
	})
		.then(response => response.blob())
		.then(blob => {
			// 创建blob链接
			// 创建一个对象URL，用于将blob对象暴露为一个URL，这样可以在HTML元素中引用此URL来加载blob对象的内容
			const blobLink = URL.createObjectURL(blob);

			// 创建下载链接元素
			const downloadLink = document.createElement('a')

			// 设置文件名
			const fileName = name

			// 设置下载链接的URL
			downloadLink.href = blobLink

			// 设置下载属性
			downloadLink.download = fileName

			// 将元素添加到DOM
			document.body.appendChild(downloadLink)

			// 触发点击事件，开始下载
			downloadLink.click()

			// 从DOM中移除元素
			document.body.removeChild(downloadLink)
		})
		.catch(error => {
			console.error(error)
			throw new Error('Failed to download image')
		})
}

export { downloadImg }
