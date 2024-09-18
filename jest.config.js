// 导入next/jest模块，用于集成Next.js和Jest测试框架
const nextJest = require('next/jest');

// 创建Jest配置，初始化nextJest函数并指定目录
const createJestConfig = nextJest({
	dir: './',
});

// 定义自定义Jest配置对象
const customJestConfig = {
	// 指定模块搜索目录，优先搜索<rootDir>/
	moduleDirectories: ['node_modules', '<rootDir>/'],
	// 设置测试环境为jsdom，以便测试时有浏览器环境
	testEnvironment: 'jest-environment-jsdom',
	// 使用ts-jest预设，支持TypeScript
	preset: 'ts-jest',
	// 定义文件转换规则，将特定的JSX/TSX文件交由ts-jest处理
	transform: {
		'node_modules/variables/.+\\.(j|t)sx?$': 'ts-jest',
	},
	// 设置转换忽略规则，排除node_modules中除variables文件夹外的其他文件
	transformIgnorePatterns: ['node_modules/(?!variables/.*)'],
	// 忽略e2e测试路径，e2e测试将不在常规测试中执行
	testPathIgnorePatterns: ['<rootDir>/e2e'],
	// 在环境设置后执行的文件，用于自定义测试设置
	setupFilesAfterEnv: ['./app/jest.setup.js'],
};

// 导出配置，将自定义配置传递给createJestConfig函数，完成Jest配置的创建
module.exports = createJestConfig(customJestConfig);