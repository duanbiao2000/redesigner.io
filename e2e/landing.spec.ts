// 导入Playwright的test库和expect库，用于编写测试用例和断言
import { test, expect } from '@playwright/test';
// 导入dotenv库，用于加载和使用环境变量
import dotenv from 'dotenv';

// 配置dotenv，指定环境变量文件路径
dotenv.config({
	path: `.env.local`,
});

// 从环境变量中获取基础URL，用于访问测试网站
const baseURL = process.env.BASE_URL as string;

// 编写测试用例'Has title'，检查页面标题是否可见
test('Has title', async ({ page }) => {
	// 访问基础URL对应网站
	await page.goto(baseURL);

	// 使用soft断言检查指定标题的可见性，标题为'Redesign your home with AI'
	await expect
		.soft(page.getByRole('heading', { name: 'Redesign your home with AI' }))
		.toBeVisible()
});

// 编写测试用例'Redesign Room Button Visible'，检查'Redesign Room'按钮是否可见
test('Redesign Room Button Visible ', async ({ page }) => {
	// 访问基础URL对应网站
	await page.goto(baseURL);

	// 检查名为'Redesign Room'的按钮是否可见
	await expect(
		page.getByRole('button', { name: 'Redesign Room' }),
	).toBeVisible()
});

// 编写测试用例'Redesign Building Button Visible'，检查'Redesign Building'按钮是否可见
test('Redesign Building Button Visible ', async ({ page }) => {
	// 访问基础URL对应网站
	await page.goto(baseURL);

	// 检查名为'Redesign Building'的按钮是否可见
	await expect(
		page.getByRole('button', { name: 'Redesign Building' }),
	).toBeVisible()
});