/** 
 * Next.js 配置文件，用于配置 Next.js 项目的各种设置
 * 此配置特别关注了图片加载的设置，通过预定义远程模式来管理不同域名的图片加载
 * @type {import('next').NextConfig} 表示该配置对象符合 Next.js 配置的类型
 */
const nextConfig = {
	// 图片加载配置，用于指定允许加载图片的远程服务器模式
	images: {
		remotePatterns: [
			// 定义第一个远程图片加载模式
			{
				// 图片加载协议，这里指定为 https
				protocol: 'https',
				// 允许加载图片的主机名，此处为 upcdn.io
				hostname: 'upcdn.io',
				// 端口号留空，表示使用默认端口
				port: '',
				// 图片路径的通配符，表示从该主机加载的所有路径都允许
				pathname: '/**',
			},
			// 定义第二个远程图片加载模式
			{
				// 图片加载协议，同样为 https
				protocol: 'https',
				// 允许加载图片的主机名，此处为 replicate.delivery
				hostname: 'replicate.delivery',
				// 端口号同样留空，使用默认端口
				port: '',
				// 图片路径的通配符，同样表示从该主机加载的所有路径都允许
				pathname: '/**',
			},
		],
	},
}

// 导出 nextConfig 对象，供 Next.js 项目使用
module.exports = nextConfig